"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Tag } from "lucide-react";

export default function ResourcesPage() {
    // Resources feature is coming soon - for now showing placeholder
    const resources: Array<{ id: string, title: string, content: string, tags: string[] }> = [];

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
            </div>

            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Library Coming Soon</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                    The resources library is being upgraded. Check back soon!
                </p>
            </div>

            {resources.length > 0 && (
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
