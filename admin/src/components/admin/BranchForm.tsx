"use client";

import { useState } from "react";
import { createBranch, updateBranch, deleteBranch } from "@/actions/admin-branches";
import { Branch } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface BranchFormProps {
    branch?: Branch | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BranchForm({ branch, open, onOpenChange }: BranchFormProps) {
    const isEdit = !!branch;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState(branch?.name || "");
    const [code, setCode] = useState(branch?.code || "");
    const [lineChannelId, setLineChannelId] = useState(branch?.lineChannelId || "");
    const [lineChannelSecret, setLineChannelSecret] = useState(branch?.lineChannelSecret || "");
    const [lineChannelAccessToken, setLineChannelAccessToken] = useState(branch?.lineChannelAccessToken || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const data = {
            name,
            code,
            lineChannelId,
            lineChannelSecret,
            lineChannelAccessToken,
        };

        try {
            let result;
            if (isEdit) {
                result = await updateBranch(branch!.id, data);
            } else {
                result = await createBranch(data);
            }

            if (result?.error) {
                setError(result.error);
            } else {
                onOpenChange(false);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Branch" : "Add New Branch"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Branch Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. BKM Branch"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Branch Code *</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. BKM"
                                required
                                disabled={isEdit}
                            />
                            {!isEdit && <p className="text-xs text-muted-foreground">Unique code (e.g., URL suffix)</p>}
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <h4 className="font-medium text-sm text-slate-700">LINE Official Account Settings</h4>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="channelId">Channel ID</Label>
                        <Input
                            id="channelId"
                            value={lineChannelId}
                            onChange={(e) => setLineChannelId(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="channelSecret">Channel Secret</Label>
                        <Input
                            id="channelSecret"
                            value={lineChannelSecret}
                            onChange={(e) => setLineChannelSecret(e.target.value)}
                            placeholder="Optional"
                            type="password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="channelAccessToken">Channel Access Token</Label>
                        <Input
                            id="channelAccessToken"
                            value={lineChannelAccessToken}
                            onChange={(e) => setLineChannelAccessToken(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Branch"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteBranchButton({ id, name }: { id: string, name: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete the branch "${name}"? This action cannot be undone and will fail if the branch has associated data.`)) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteBranch(id);
        setIsDeleting(false);

        if (result?.error) {
            alert(result.error);
        }
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? "..." : "Delete"}
        </Button>
    );
}
