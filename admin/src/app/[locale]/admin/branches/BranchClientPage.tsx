"use client";

import { useState } from "react";
import { Branch } from "@prisma/client";
import { BranchForm, DeleteBranchButton } from "@/components/admin/BranchForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function BranchClientPage({ branches }: { branches: Branch[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    const handleCreate = () => {
        setSelectedBranch(null);
        setIsFormOpen(true);
    };

    const handleEdit = (branch: Branch) => {
        setSelectedBranch(branch);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500">
                    Total: {branches.length} Branches
                </p>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[150px]">Code</TableHead>
                            <TableHead>Branch Name</TableHead>
                            <TableHead>LINE Webhook URL</TableHead>
                            <TableHead>Has Secret / Token</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No branches found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            branches.map((branch) => (
                                <TableRow key={branch.id}>
                                    <TableCell className="font-medium">{branch.code}</TableCell>
                                    <TableCell>{branch.name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        <code>/api/line/{branch.code.toLowerCase()}</code>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 text-xs">
                                            {branch.lineChannelSecret ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Secret ✅</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Secret ❌</span>
                                            )}
                                            {branch.lineChannelAccessToken ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Token ✅</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Token ❌</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>
                                                Edit
                                            </Button>
                                            <DeleteBranchButton id={branch.id} name={branch.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isFormOpen && (
                <BranchForm
                    branch={selectedBranch}
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                />
            )}
        </div>
    );
}
