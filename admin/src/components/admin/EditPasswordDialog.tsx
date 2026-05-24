"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { updateUserPassword } from "@/actions/admin-users";

interface Props {
    userId: string;
    userName: string;
}

export function EditPasswordDialog({ userId, userName }: Props) {
    const [open, setOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        const result = await updateUserPassword(userId, newPassword);

        if (result.success) {
            alert(`✅ Password updated successfully!`);
            setOpen(false);
            setNewPassword("");
        } else {
            alert(`❌ Failed to update password`);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Password"
                >
                    <Key size={16} />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Set a new password for <span className="font-bold text-gray-800">{userName}</span>.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                minLength={6}
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
