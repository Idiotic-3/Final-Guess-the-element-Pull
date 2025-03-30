
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ScoreBoardProps {
  score: number;
  questionNumber: number;
  resetGame: () => void;
}

const ScoreBoard = ({ score, questionNumber, resetGame }: ScoreBoardProps) => {
  const calculatePercentage = () => {
    if (questionNumber === 0) return 0;
    return Math.round((score / questionNumber) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <p className="text-gray-600 text-sm">Score</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        
        <div className="text-center flex-1">
          <p className="text-gray-600 text-sm">Questions</p>
          <p className="text-2xl font-bold">{questionNumber}</p>
        </div>
        
        <div className="text-center flex-1">
          <p className="text-gray-600 text-sm">Accuracy</p>
          <p className="text-2xl font-bold">
            {calculatePercentage()}%
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetGame}
          className="ml-4 flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ScoreBoard;
