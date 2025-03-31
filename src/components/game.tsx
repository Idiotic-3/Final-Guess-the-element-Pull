import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { StreakDisplay } from "./streak-display";
import { AchievementsPanel } from "./achievements/achievements-panel";
import { PeriodicTable } from "./periodic-table/periodic-table";
import { QuestionPanel } from "./question-panel";
import { achievements as defaultAchievements } from "@/data/achievements";
import { Achievement } from "@/types/achievements";
import { elementData } from "@/data/elements";
import { questions } from "@/data/questions";
import { ElementData, Question } from "@/types/game";
import { Loader2, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Game() {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // Symbol guessing game state
  const [currentElement, setCurrentElement] = useState(getRandomElement());
  const [guess, setGuess] = useState("");
  // Question game state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(getRandomQuestion());
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  // Shared state
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  const loadUserData = useCallback(async () => {
    if (!auth.session?.user) return;

    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", auth.session.user.id)
      .single();

    if (streakData) {
      setCurrentStreak(streakData.current_streak);
      setLongestStreak(streakData.longest_streak);
    }

    const { data: achievementsData } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", auth.session.user.id);

    if (achievementsData) {
      const unlockedAchievements = new Set(achievementsData.map(a => a.achievement_id));
      setAchievements(achievements.map(a => ({
        ...a,
        unlocked: unlockedAchievements.has(a.id)
      })));
    }
  }, [auth.session?.user, achievements]);

  useEffect(() => {
    if (auth.session?.user) {
      loadUserData();
    }
  }, [auth.session?.user, loadUserData]);

  function getRandomElement() {
    return elementData[Math.floor(Math.random() * elementData.length)];
  }

  function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)];
  }

  async function handleElementClick(element: ElementData) {
    if (!auth.session?.user || !currentQuestion) return;
    setSelectedElement(element);
    
    const isCorrect = element.symbol === currentQuestion.correctElement;
    handleAnswer(isCorrect);

    if (isCorrect) {
      toast({
        title: "Correct! ",
        description: `${element.name} (${element.symbol}) is the right answer!`,
      });
      setTimeout(() => {
        setSelectedElement(null);
        setCurrentQuestion(getRandomQuestion());
      }, 1500);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect",
        description: `Try again! Hint: ${currentQuestion.hint}`,
      });
    }
  }

  async function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.session?.user) return;

    setLoading(true);
    const isCorrect = guess.toLowerCase() === currentElement.name.toLowerCase();
    handleAnswer(isCorrect);
    
    if (isCorrect) {
      toast({
        title: "Correct! ",
        description: `That's right! It's ${currentElement.name}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect",
        description: `The correct answer was ${currentElement.name}`,
      });
    }

    // Reset for next round
    setGuess("");
    setCurrentElement(getRandomElement());
    setLoading(false);
  }

  async function handleAnswer(isCorrect: boolean) {
    setTotalQuestions(prev => prev + 1);
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCurrentStreak(prev => prev + 1);
      setLongestStreak(prev => Math.max(prev, currentStreak + 1));
    } else {
      setCurrentStreak(0);
    }

    // Update streak in database
    await supabase
      .from("user_streaks")
      .upsert({
        user_id: auth.session?.user.id,
        current_streak: isCorrect ? currentStreak + 1 : 0,
        longest_streak: Math.max(longestStreak, isCorrect ? currentStreak + 1 : 0),
        last_game_date: new Date().toISOString()
      });

    // Save game history
    await supabase
      .from("game_history")
      .insert({
        user_id: auth.session?.user.id,
        score: isCorrect ? 1 : 0,
        total_questions: 1
      });

    // Check and update achievements
    const newAchievements = [...achievements];
    let achievementsUnlocked = false;

    for (const achievement of newAchievements) {
      if (achievement.unlocked) continue;

      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.type) {
        case "score":
          if (achievement.id === "first_win" && isCorrect) {
            shouldUnlock = true;
          }
          break;
        case "streak": {
          progress = isCorrect ? currentStreak + 1 : 0;
          achievement.progress = progress;
          if (progress >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        }
        case "total_games": {
          progress = totalQuestions + 1;
          achievement.progress = progress;
          if (progress >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        }
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievementsUnlocked = true;
        await supabase
          .from("user_achievements")
          .insert({
            user_id: auth.session?.user.id,
            achievement_id: achievement.id
          });
      }
    }

    if (achievementsUnlocked) {
      setAchievements(newAchievements);
      toast({
        title: "Achievement Unlocked! ",
        description: "Check your achievements panel to see what you've earned!",
      });
    }
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <StreakDisplay
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />
        <AchievementsPanel achievements={achievements} />
      </div>

      <Tabs defaultValue="symbol" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="symbol">Symbol Game</TabsTrigger>
          <TabsTrigger value="periodic">Periodic Table Game</TabsTrigger>
        </TabsList>

        <TabsContent value="symbol" className="mt-6">
          <Card className="p-6 text-center space-y-4">
            <div className="text-6xl font-bold mb-4">{currentElement.symbol}</div>
            <div className="text-2xl text-muted-foreground mb-4">
              Atomic Number: {currentElement.atomicNumber}
            </div>
            
            <form onSubmit={handleGuess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guess">Enter element name:</Label>
                <Input
                  id="guess"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={loading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit Answer"
                )}
              </Button>
            </form>

            <div className="text-sm text-muted-foreground">
              Score: {score}/{totalQuestions}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="periodic" className="mt-6">
          {currentQuestion && (
            <>
              <QuestionPanel
                question={currentQuestion}
                questionNumber={totalQuestions}
                score={score}
                totalQuestions={totalQuestions}
              />
              <div className="mt-6">
                <PeriodicTable
                  onElementClick={handleElementClick}
                  selectedElement={selectedElement}
                  correctElement={currentQuestion.correctElement}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
