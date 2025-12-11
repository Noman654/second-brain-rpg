"use client";

import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Flame, PlusCircle, Trash2, Trophy, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type Habit = Database['public']['Tables']['habits']['Row'];

export default function HabitsPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { habits, areas, createHabit, completeHabit, deleteHabit } = useGameStore();

    // Form state
    const [title, setTitle] = useState("");
    const [areaId, setAreaId] = useState("");
    const [xpReward, setXpReward] = useState("25");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await createHabit(title, areaId, parseInt(xpReward) || 25);

        setLoading(false);
        setCreateOpen(false);
        setTitle("");
        setAreaId("");
        setXpReward("25");
    };

    const getAreaForHabit = (habit: Habit) => {
        return areas.find(a => a.id === habit.linked_area_id);
    };

    const isCompletedToday = (habit: Habit) => {
        const today = new Date().toISOString().split('T')[0];
        return habit.last_completed_date === today;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Flame className="w-6 h-6 text-orange-500" />
                        Daily Habits
                    </h2>
                    <p className="text-muted-foreground">
                        Build streaks and earn XP every day. Habits reset at midnight.
                    </p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            New Habit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Daily Habit</DialogTitle>
                            <DialogDescription>
                                Set up a recurring habit to track every day.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Habit Name</Label>
                                <Input
                                    placeholder="e.g. Exercise, Read, Meditate"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Linked Realm</Label>
                                <Select value={areaId} onValueChange={setAreaId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Realm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.map(area => (
                                            <SelectItem key={area.id} value={area.id}>
                                                {area.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>XP Reward</Label>
                                <Select value={xpReward} onValueChange={setXpReward}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 XP (Easy)</SelectItem>
                                        <SelectItem value="25">25 XP (Medium)</SelectItem>
                                        <SelectItem value="50">50 XP (Hard)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Habit"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
                    <Flame className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No Daily Habits Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        Create habits to build streaks and earn XP every day.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {habits.map((habit) => {
                        const area = getAreaForHabit(habit);
                        const completedToday = isCompletedToday(habit);

                        return (
                            <Card
                                key={habit.id}
                                className={cn(
                                    "transition-all hover:shadow-md group",
                                    completedToday && "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30"
                                )}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={completedToday}
                                                onCheckedChange={() => !completedToday && completeHabit(habit.id)}
                                                className="h-6 w-6"
                                                disabled={completedToday}
                                            />
                                            <CardTitle className={cn(
                                                "text-base font-bold",
                                                completedToday && "line-through text-muted-foreground"
                                            )}>
                                                {habit.title}
                                            </CardTitle>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                            onClick={() => deleteHabit(habit.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {area && (
                                            <Badge variant="outline" className="text-[10px]">
                                                {area.title}
                                            </Badge>
                                        )}
                                        {habit.target_minutes && (
                                            <Badge variant="secondary" className="text-[10px]">
                                                <Clock className="w-2.5 h-2.5 mr-1" />
                                                {habit.target_minutes} min
                                            </Badge>
                                        )}
                                        <Badge className="text-[10px] bg-primary/10 text-primary">
                                            <Zap className="w-2.5 h-2.5 mr-1" />
                                            +{habit.xp_reward} XP
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <Flame className={cn(
                                                "w-4 h-4",
                                                habit.streak > 0 ? "text-orange-500" : "text-muted-foreground"
                                            )} />
                                            <span className={cn(
                                                "font-bold",
                                                habit.streak > 0 ? "text-orange-500" : "text-muted-foreground"
                                            )}>
                                                {habit.streak} day streak
                                            </span>
                                        </div>
                                        {habit.best_streak > 0 && (
                                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                <Trophy className="w-3 h-3" />
                                                Best: {habit.best_streak}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
