"use client";

import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Swords, Brain, Users, Coins, PlusCircle, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/lib/database.types";

type Area = Database['public']['Tables']['areas']['Row'];

const ATTRIBUTE_ICONS: Record<string, typeof Swords> = {
    strength: Swords,
    intellect: Brain,
    charisma: Users,
    wealth: Coins,
};

const ATTRIBUTE_COLORS: Record<string, string> = {
    strength: "text-red-500",
    intellect: "text-blue-500",
    charisma: "text-purple-500",
    wealth: "text-yellow-500",
};

type AttributeType = 'strength' | 'intellect' | 'charisma' | 'wealth';

export default function AreasPage() {
    const { areas, projects, createArea, updateArea, deleteArea } = useGameStore();

    // Create modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newAttribute, setNewAttribute] = useState<AttributeType>("intellect");
    const [loading, setLoading] = useState(false);

    // Edit modal state  
    const [editOpen, setEditOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    const [editTitle, setEditTitle] = useState("");

    // Delete confirmation state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingArea, setDeletingArea] = useState<Area | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await createArea(newTitle, newAttribute);
        setLoading(false);
        setCreateOpen(false);
        setNewTitle("");
        setNewAttribute("intellect");
    };

    const handleEdit = (area: Area) => {
        setEditingArea(area);
        setEditTitle(area.title);
        setEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingArea) {
            setLoading(true);
            await updateArea(editingArea.id, editTitle);
            setLoading(false);
            setEditOpen(false);
            setEditingArea(null);
        }
    };

    const handleDeleteClick = (area: Area) => {
        setDeletingArea(area);
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingArea) {
            setLoading(true);
            await deleteArea(deletingArea.id);
            setLoading(false);
            setDeleteOpen(false);
            setDeletingArea(null);
        }
    };

    const getLinkedProjectsCount = (areaId: string) => {
        return projects.filter(p => p.linked_area_id === areaId).length;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Realms (Areas of Responsibility)
                    </h2>
                    <p className="text-muted-foreground">
                        Long-term areas of your life that require ongoing attention.
                    </p>
                </div>

                {/* Create Area Modal */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            New Realm
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Realm</DialogTitle>
                            <DialogDescription>
                                Add a new area of responsibility to track.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Realm Name</Label>
                                <Input
                                    placeholder="e.g. Personal Finance"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Linked Attribute</Label>
                                <Select value={newAttribute} onValueChange={(v) => setNewAttribute(v as AttributeType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strength">💪 Strength (Health/Fitness)</SelectItem>
                                        <SelectItem value="intellect">🧠 Intellect (Learning/Study)</SelectItem>
                                        <SelectItem value="charisma">👥 Charisma (Social/Network)</SelectItem>
                                        <SelectItem value="wealth">💰 Wealth (Finance/Career)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Realm"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Area Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Realm</DialogTitle>
                        <DialogDescription>
                            Update this area of responsibility.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Realm Name</Label>
                            <Input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Realm
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingArea?.title}"?
                            {deletingArea && getLinkedProjectsCount(deletingArea.id) > 0 && (
                                <span className="block mt-2 text-amber-500 font-medium">
                                    ⚠️ This realm has {getLinkedProjectsCount(deletingArea.id)} linked quest(s).
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {areas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No Realms Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        Create realms to organize your areas of responsibility.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {areas.map((area) => {
                        const Icon = ATTRIBUTE_ICONS[area.associated_attribute] || Target;
                        const colorClass = ATTRIBUTE_COLORS[area.associated_attribute] || "text-primary";
                        const activeProjects = projects.filter(p => p.linked_area_id === area.id && !p.is_completed);

                        return (
                            <Card key={area.id} className="hover:shadow-md transition-all group">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Icon className={`w-5 h-5 ${colorClass}`} />
                                            {area.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="uppercase text-[10px]">
                                                Level {area.current_level}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleEdit(area)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteClick(area)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{activeProjects.length}</span> active quest{activeProjects.length !== 1 ? 's' : ''} linked
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground capitalize">
                                        Attribute: <span className={`font-bold ${colorClass}`}>{area.associated_attribute}</span>
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
