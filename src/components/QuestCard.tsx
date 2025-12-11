"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast } from "date-fns";
import { EditQuestModal } from "./EditQuestModal";
import { Trophy, Clock, AlertCircle, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type Project = Database['public']['Tables']['projects']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];

interface ProjectWithMilestones extends Project {
    milestones: Milestone[];
}

interface QuestCardProps {
    project: ProjectWithMilestones;
}

// ... existing imports

export function QuestCard({ project }: QuestCardProps) {
    const { toggleMilestone, completeProject, deleteProject, areas } = useGameStore();
    const [confettiLoaded, setConfettiLoaded] = useState<(() => void) | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const completedMilestones = project.milestones.filter(m => m.is_done).length;
    const totalMilestones = project.milestones.length;
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const isOverdue = project.deadline ? isPast(new Date(project.deadline)) && !project.is_completed : false;
    const area = areas.find(a => a.id === project.linked_area_id);

    // ... useEffect ...

    const handleComplete = () => {
        if (confettiLoaded) {
            confettiLoaded();
        }
        completeProject(project.id);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this quest?")) {
            deleteProject(project.id);
        }
    };

    return (
        <>
            <Card className={cn(
                "flex flex-col h-full transition-all hover:shadow-md border-l-4 group relative",
                isOverdue ? "border-destructive/50 ring-1 ring-destructive/20" : "border-l-primary",
                project.is_completed && "opacity-50"
            )}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
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
                                {project.deadline && (
                                    <div className="flex items-center text-[10px] text-muted-foreground ml-auto">
                                        {isOverdue ? <AlertCircle className="w-3 h-3 text-destructive mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                        {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md border shadow-sm p-0.5 md:relative md:top-0 md:right-0 md:bg-transparent md:border-0 md:shadow-none md:p-0">
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setIsEditOpen(true)}>
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
                            <div key={milestone.id} className="flex items-center space-x-2 group/milestone">
                                <Checkbox
                                    id={milestone.id}
                                    checked={milestone.is_done}
                                    onCheckedChange={() => toggleMilestone(milestone.id, project.id)}
                                />
                                <label
                                    htmlFor={milestone.id}
                                    className={cn(
                                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover/milestone:text-primary transition-colors",
                                        milestone.is_done && "line-through text-muted-foreground"
                                    )}
                                >
                                    {milestone.text}
                                </label>
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="pt-2 pb-4">
                    {progress === 100 && !project.is_completed ? (
                        <Button onClick={handleComplete} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0 shadow-lg animate-pulse">
                            <Trophy className="w-4 h-4 mr-2" />
                            Complete Quest (+{project.xp_reward} XP)
                        </Button>
                    ) : (
                        <div className="w-full text-center text-xs text-muted-foreground">
                            Reward: <span className="font-bold text-primary">{project.xp_reward} XP</span>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <EditQuestModal project={project} open={isEditOpen} onOpenChange={setIsEditOpen} />
        </>
    );
}
