"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { Difficulty, Project } from "@/types";


export function CreateQuestModal() {
    const [open, setOpen] = useState(false);
    const { createProject, areas } = useGameStore();

    const [title, setTitle] = useState("");
    const [areaId, setAreaId] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
    const [milestonesText, setMilestonesText] = useState("");
    const [deadline, setDeadline] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse milestones (one per line)
        const milestones = milestonesText
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(text => ({
                id: crypto.randomUUID(),
                text: text.trim(),
                isDone: false
            }));

        const xpMap: Record<Difficulty, number> = {
            'EASY': 50,
            'MEDIUM': 100,
            'HARD': 200,
            'EPIC': 500
        };

        const newProject: Project = {
            id: crypto.randomUUID(),
            title,
            category: 'PROJECT',
            linkedAreaId: areaId,
            difficulty,
            milestones,
            isCompleted: false,
            deadline: deadline ? new Date(deadline) : new Date(Date.now() + 86400000 * 7), // Default 7 days
            xpReward: xpMap[difficulty]
        };

        createProject(newProject);
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setAreaId("");
        setDifficulty("EASY");
        setMilestonesText("");
        setDeadline("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    New Quest
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>It's Dangerous to Go Alone</DialogTitle>
                    <DialogDescription>
                        Create a new quest. Link it to an element to gain attribute points.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Quest Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Build API Integration"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Linked Realm (Area)</Label>
                            <Select value={areaId} onValueChange={setAreaId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {areas.map(area => (
                                        <SelectItem key={area.id} value={area.id}>
                                            {area.title} ({area.associatedAttribute})
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
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Milestones (One per line)</Label>
                        <Textarea
                            placeholder="- API Setup&#10;- Auth Implementation&#10;- Database Schema"
                            value={milestonesText}
                            onChange={e => setMilestonesText(e.target.value)}
                            className="min-h-[100px]"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full">Accept Quest</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
