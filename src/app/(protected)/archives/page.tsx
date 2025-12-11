"use client";

import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ArchivesPage() {
    const { archives } = useGameStore();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Archive className="w-6 h-6 text-primary" />
                    Graveyard (Archives)
                </h2>
                <p className="text-muted-foreground">
                    Completed quests and achievements. Your Hall of Fame!
                </p>
            </div>

            {archives.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No Achievements Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        Complete quests to add them to your Hall of Fame.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {archives.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-all bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    <CardTitle className="text-base font-bold line-clamp-1">{item.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-[10px]">
                                        {item.type}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(item.completed_date), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
