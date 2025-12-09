"use client";

import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, PlusCircle, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { Resource } from "@/types";

export default function ResourcesPage() {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const { resources, createResource } = useGameStore();

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tagsText, setTagsText] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tags = tagsText.split(',').map(t => t.trim()).filter(t => t.length > 0);

        const newResource: Resource = {
            id: crypto.randomUUID(),
            title,
            content,
            tags,
            category: 'RESOURCE',
        };

        createResource(newResource);
        setOpen(false);
        setTitle("");
        setContent("");
        setTagsText("");
    };

    if (!mounted) {
        return <div className="p-8">Loading Library...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        Library (Resources)
                    </h2>
                    <p className="text-muted-foreground">
                        Notes, references, and knowledge you want to save.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add to Library</DialogTitle>
                            <DialogDescription>
                                Save a note or reference for later use.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Title</Label>
                                <Input
                                    placeholder="e.g. React Best Practices"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Content</Label>
                                <Textarea
                                    placeholder="Your notes or content..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tags (comma separated)</Label>
                                <Input
                                    placeholder="react, programming, tips"
                                    value={tagsText}
                                    onChange={e => setTagsText(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">Save Resource</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Your Library is Empty</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        Add resources, notes, and references to build your knowledge base.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold line-clamp-1">{resource.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                    {resource.content}
                                </p>
                                {resource.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {resource.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px]">
                                                <Tag className="w-2.5 h-2.5 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
