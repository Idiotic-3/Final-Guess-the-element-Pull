import { Achievement } from "@/types/achievements";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Trophy } from "lucide-react";

interface AchievementsPanelProps {
  achievements: Achievement[];
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trophy className="h-4 w-4" />
          Achievements ({unlockedCount}/{totalCount})
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Achievements</SheetTitle>
          <SheetDescription>
            Your progress in mastering the periodic table
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.unlocked
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-gray-500/10 border-gray-500/20"
              }`}
            >
              <div className="font-medium">{achievement.name}</div>
              <div className="text-sm text-muted-foreground">
                {achievement.description}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
