import { Question } from "@/types/game";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface QuestionPanelProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

const QuestionPanel = ({ question, onAnswer }: QuestionPanelProps) => {
  const [showHint, setShowHint] = useState(false);
  
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">{question.text}</h2>
      
      {question.hint && (
        <div className="w-full flex flex-col items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setShowHint(!showHint)}
          >
            <HelpCircle className="h-4 w-4" />
            {showHint ? "Hide hint" : "Show hint"}
          </Button>
          
          {showHint && (
            <div className="text-sm italic text-muted-foreground mt-2 text-center max-w-md">
              {question.hint}
            </div>
          )}
        </div>
      )}
      
      <p className="text-lg text-center text-muted-foreground mb-4">
        Click on the correct element in the periodic table below
      </p>
    </div>
  );
};

export default QuestionPanel;
