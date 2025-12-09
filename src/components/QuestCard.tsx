"use client";

import { useEffect, useState } from "react";
import { Project } from "@/types";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast } from "date-fns";
import { Trophy, Clock, AlertCircle } from "lucide-react";

interface QuestCardProps {
    project: Project;
}

export function QuestCard({ project }: QuestCardProps) {
    const { toggleMilestone, completeProject, areas } = useGameStore();
    const [confettiLoaded, setConfettiLoaded] = useState<(() => void) | null>(null);

    const completedMilestones = project.milestones.filter(m => m.isDone).length;
    const totalMilestones = project.milestones.length;
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const isOverdue = isPast(new Date(project.deadline)) && !project.isCompleted;
    const area = areas.find(a => a.id === project.linkedAreaId);

    useEffect(() => {
        // Dynamically load confetti only on the client-side
        import("canvas-confetti").then((module) => {
            setConfettiLoaded(() => () => {
                module.default({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });
        }).catch(() => {
            // Silently fail if confetti fails to load
        });
    }, []);

    const handleComplete = () => {
        if (confettiLoaded) {
            confettiLoaded();
        }
        completeProject(project.id);
    };
    return (
        <Card className={cn(
            "flex flex-col h-full transition-all hover:shadow-md border-l-4",
            isOverdue ? "border-destructive/50 ring-1 ring-destructive/20" : "border-l-primary",
            project.isCompleted && "opacity-50"
        )}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-2">{project.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {area && (
                                <Badge variant="outline" className="text-[10px] h-5 bg-secondary/50 font-medium">
                                    {area.title}
                                </Badge>
                            )}
                            <Badge variant={project.difficulty === 'EPIC' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                {project.difficulty}
                            </Badge>
                            <div className="flex items-center text-[10px] text-muted-foreground ml-auto">
                                {isOverdue ? <AlertCircle className="w-3 h-3 text-destructive mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 py-2">
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center space-x-2 group">
                            <Checkbox
                                id={milestone.id}
                                checked={milestone.isDone}
                                onCheckedChange={() => toggleMilestone(project.id, milestone.id)}
                            />
                            <label
                                htmlFor={milestone.id}
                                className={cn(
                                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors",
                                    milestone.isDone && "line-through text-muted-foreground"
                                )}
                            >
                                {milestone.text}
                            </label>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="pt-2 pb-4">
                {progress === 100 && !project.isCompleted ? (
                    <Button onClick={handleComplete} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0 shadow-lg animate-pulse">
                        <Trophy className="w-4 h-4 mr-2" />
                        Complete Quest (+{project.xpReward} XP)
                    </Button>
                ) : (
                    <div className="w-full text-center text-xs text-muted-foreground">
                        Reward: <span className="font-bold text-primary">{project.xpReward} XP</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
