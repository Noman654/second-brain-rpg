"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/lib/database.types";

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
type Project = Database['public']['Tables']['projects']['Row'];

interface EditQuestModalProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditQuestModal({ project, open, onOpenChange }: EditQuestModalProps) {
    const { updateProject, areas } = useGameStore();
    const [title, setTitle] = useState(project.title);
    const [areaId, setAreaId] = useState(project.linked_area_id || "none");
    const [difficulty, setDifficulty] = useState<Difficulty>(project.difficulty as Difficulty);
    const [deadline, setDeadline] = useState(project.deadline ? project.deadline.split('T')[0] : "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const xpMap: Record<Difficulty, number> = {
            'EASY': 50,
            'MEDIUM': 100,
            'HARD': 200,
            'EPIC': 500
        };

        await updateProject(project.id, {
            title,
            linked_area_id: areaId === "none" ? null : areaId,
            difficulty,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            xp_reward: xpMap[difficulty]
        });

        setLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Quest</DialogTitle>
                    <DialogDescription>
                        Modify your quest details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Quest Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Linked Realm (Area)</Label>
                            <Select value={areaId} onValueChange={setAreaId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {areas.map(area => (
                                        <SelectItem key={area.id} value={area.id}>
                                            {area.title} ({area.associated_attribute})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Difficulty</Label>
                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY">Easy (+50 XP)</SelectItem>
                                    <SelectItem value="MEDIUM">Medium (+100 XP)</SelectItem>
                                    <SelectItem value="HARD">Hard (+200 XP)</SelectItem>
                                    <SelectItem value="EPIC">Epic (+500 XP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Deadline</Label>
                        <Input
                            type="date"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
