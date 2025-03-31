import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ElementData, Question } from "@/types/game";
import { questions } from "@/data/questions";
import { getRandomElement } from "@/lib/utils";
import PeriodicTable from "@/components/PeriodicTable";
import ScoreBoard from "@/components/ScoreBoard";
import QuestionPanel from "@/components/QuestionPanel";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { session, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(getRandomElement(questions));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    const isCorrect = answer.toLowerCase() === currentQuestion.correctElement.toLowerCase();
    
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      toast({
        title: "Correct!",
        description: `That's right! It's ${currentQuestion.correctElement}`,
      });
    } else {
      setStreak(0);
      toast({
        title: "Incorrect",
        description: `The correct answer was ${currentQuestion.correctElement}`,
        variant: "destructive",
      });
    }

    // If user is logged in, save their progress
    if (session.user) {
      try {
        await saveProgress(isCorrect);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }

    setCurrentQuestion(getRandomElement(questions));
  };

  const saveProgress = async (isCorrect: boolean) => {
    if (!session.user) return;

    const timestamp = new Date().toISOString();
    
    // Save game history
    await supabase.from('game_history').insert({
      user_id: session.user.id,
      correct: isCorrect,
      played_at: timestamp,
    });

    // Update user streak
    if (isCorrect) {
      await supabase.from('user_streaks')
        .upsert({
          user_id: session.user.id,
          current_streak: streak + 1,
          longest_streak: Math.max(streak + 1, session.profile?.longest_streak || 0),
          last_game_date: timestamp,
        });
    } else {
      await supabase.from('user_streaks')
        .upsert({
          user_id: session.user.id,
          current_streak: 0,
          longest_streak: session.profile?.longest_streak || 0,
          last_game_date: timestamp,
        });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
      }
      setShowAuth(false); // Hide auth form after successful login/signup
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to authenticate",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner only during initial auth check
  if (session.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="container max-w-lg mx-auto py-8 space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to Element Guesser!</h1>
          <p className="mb-6">Test your knowledge of the periodic table by guessing element symbols.</p>
          
          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => setGameStarted(true)}
            >
              Play as Guest
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAuth(true);
                setGameStarted(true);
              }}
            >
              Sign In to Save Progress
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <Card className="p-6">
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <Button disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAuth(false);
                setGameStarted(true);
              }}
            >
              Continue as Guest
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <ScoreBoard score={score} streak={streak} />
        {!session.user ? (
          <Button variant="outline" onClick={() => setShowAuth(true)}>
            Sign In to Save Progress
          </Button>
        ) : (
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        )}
      </div>

      {currentQuestion && (
        <>
          <QuestionPanel
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
          <PeriodicTable highlightedElement={currentQuestion.correctElement} />
        </>
      )}
    </div>
  );
}

export default Index;
