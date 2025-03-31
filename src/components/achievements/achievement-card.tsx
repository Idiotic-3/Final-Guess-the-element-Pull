import { Achievement } from "@/types/achievements";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const progress = Math.min((achievement.progress / achievement.requirement) * 100, 100);

  return (
    <Card className={`transition-all duration-300 ${achievement.unlocked ? 'bg-primary/10' : ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{achievement.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
          {achievement.unlocked && (
            <span className="text-xl" title="Unlocked">✨</span>
          )}
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="text-xs text-right text-muted-foreground">
          {achievement.progress} / {achievement.requirement}
        </p>
      </CardContent>
    </Card>
  );
}
