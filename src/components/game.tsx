import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ElementData } from "@/types/game";
import { questions } from "@/data/questions";
import { getRandomElement } from "@/lib/utils";
import { PeriodicTable } from "@/components/periodic-table/periodic-table";
import { QuestionPanel } from "./question-panel";
import { StreakDisplay } from "./streak-display";
import { AchievementsPanel } from "./achievements/achievements-panel";
import { Loader2 } from "lucide-react";
import { Achievement } from "@/types/achievements";

export function Game() {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

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
        setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
      }, 1500);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect",
        description: `Try again! Hint: ${currentQuestion.hint}`,
      });
    }
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

  // If not authenticated, show login/signup form
  if (!auth.session?.user) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <Card className="p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold">{isLogin ? "Log In" : "Sign Up"} to Play</h2>
          <p className="text-muted-foreground">You need to be logged in to play the game and track your progress.</p>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              if (isLogin) {
                await auth.signIn(email, password);
              } else {
                await auth.signUp(email, password, username);
                toast({
                  title: "Success",
                  description: "Please check your email to verify your account."
                });
              }
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to authenticate. Please try again."
              });
            } finally {
              setLoading(false);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              )}
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isLogin ? "Log In" : "Sign Up")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => auth.signInWithGoogle()}
                disabled={loading}
              >
                Continue with Google
              </Button>
            </div>
          </form>

          <div className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="underline hover:text-primary"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </Card>
      </div>
    );
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
    </div>
  );
}
