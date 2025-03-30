import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import PeriodicTable from "@/components/PeriodicTable";
import QuestionPanel from "@/components/QuestionPanel";
import ScoreBoard from "@/components/ScoreBoard";
import { AuthForm } from "@/components/auth/auth-form";
import { GameHistory } from "@/components/game-history";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/ui/use-toast";
import { ElementData, Question } from "@/types/game";
import { elementData } from "@/data/elements";
import { questions } from "@/data/questions";

const Index = () => {
  const { session } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const { toast } = useToast();

  // Initialize with a random question
  useEffect(() => {
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
    }
  }, []);

  const handleElementClick = async (element: ElementData) => {
    setSelectedElement(element);
    
    if (currentQuestion && element.symbol === currentQuestion.correctElement) {
      // Correct answer
      toast({
        title: "Correct!",
        description: `${element.name} (${element.symbol}) is the right answer!`,
        variant: "default",
        className: "bg-green-500 text-white",
      });
      
      setScore(score + 1);
      nextQuestion();
    } else if (currentQuestion) {
      // Wrong answer
      toast({
        title: "Incorrect!",
        description: `The correct answer was ${elementData.find(e => e.symbol === currentQuestion.correctElement)?.name} (${currentQuestion.correctElement})`,
        variant: "destructive",
      });
      
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    // Find a random question that's different from the current one
    let randomIndex;
    let newQuestion;
    
    do {
      randomIndex = Math.floor(Math.random() * questions.length);
      newQuestion = questions[randomIndex];
    } while (newQuestion.id === currentQuestion?.id && questions.length > 1);
    
    setCurrentQuestion(newQuestion);
    setQuestionNumber(questionNumber + 1);
    setSelectedElement(null);
  };

  const resetGame = async () => {
    // Save game history if user is logged in
    if (session.user) {
      try {
        await supabase.from('game_history').insert([
          {
            user_id: session.user.id,
            score,
            total_questions: questionNumber,
          },
        ])
      } catch (error) {
        console.error('Error saving game history:', error)
      }
    }

    setScore(0);
    setQuestionNumber(0);
    nextQuestion();
  };

  if (session.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md relative">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Element Guessing Game</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row flex-grow p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full gap-4 md:gap-6">
        <div className="flex flex-col flex-grow gap-4 md:gap-6">
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 md:p-6">
            {currentQuestion ? (
              <QuestionPanel 
                question={currentQuestion} 
                questionNumber={questionNumber} 
              />
            ) : (
              <div className="text-center p-4">Loading question...</div>
            )}
          </div>

          <ScoreBoard score={score} questionNumber={questionNumber} resetGame={resetGame} />
          
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
            <PeriodicTable 
              onElementClick={handleElementClick} 
              selectedElement={selectedElement}
              correctElement={currentQuestion?.correctElement}
            />
          </div>
        </div>

        <div className="w-full lg:w-80">
          <GameHistory />
        </div>
      </main>
    </div>
  );
};

export default Index;
