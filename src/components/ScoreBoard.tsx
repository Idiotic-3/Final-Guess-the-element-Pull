import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ScoreBoardProps {
  score: number;
  streak: number;
  resetGame: () => void;
}

const ScoreBoard = ({ score, streak, resetGame }: ScoreBoardProps) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md p-4">
      <div className="flex gap-8 items-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Score</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Current Streak</p>
          <p className="text-2xl font-bold">{streak}</p>
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
