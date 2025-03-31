import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-6 bg-card text-card-foreground rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2">
        <Flame className={`h-6 w-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
          <p className="text-2xl font-bold">{currentStreak}</p>
        </div>
      </div>
      <div className="border-l pl-6">
        <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
        <p className="text-2xl font-bold">{longestStreak}</p>
      </div>
    </div>
  );
}
