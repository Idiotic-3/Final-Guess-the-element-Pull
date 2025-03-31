import { Question } from "@/types/game";
import { Card } from "@/components/ui/card";

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  score: number;
  totalQuestions: number;
}

export function QuestionPanel({ question, questionNumber, score, totalQuestions }: QuestionPanelProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Question {questionNumber + 1}
        </div>
        <div className="text-sm font-medium">
          Score: {score}/{totalQuestions}
        </div>
      </div>
      
      <div className="text-lg font-medium">{question.text}</div>
      
      <div className="text-sm text-muted-foreground">
        Click on the correct element in the periodic table
      </div>
    </Card>
  );
}
