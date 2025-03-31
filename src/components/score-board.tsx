interface ScoreBoardProps {
  score: number;
  streak: number;
}

export function ScoreBoard({ score, streak }: ScoreBoardProps) {
  return (
    <div className="flex gap-4">
      <div className="text-lg font-medium">
        Score: <span className="text-primary">{score}</span>
      </div>
      <div className="text-lg font-medium">
        Streak: <span className="text-primary">{streak}</span>
      </div>
    </div>
  );
}
