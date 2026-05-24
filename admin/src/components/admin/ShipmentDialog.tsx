"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Package } from "lucide-react";
import { shipOrder } from "@/actions/order";
import { toast } from "sonner";

interface Props {
    orderId: string;
    customerName: string;
    customerPhone: string;
    deliveryLocation?: string;
}

export function ShipmentDialog({ orderId, customerName, customerPhone, deliveryLocation }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"RIDER" | "SHIPPING">("RIDER");
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");

    const handleAutoShip = async () => {
        setLoading(true);
        try {
            // Simulate API Call to Rider Service
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockTracking = `RIDER-${Math.floor(Math.random() * 100000)}`;

            await shipOrder(orderId, carrier || "LINEMAN", mockTracking);

            toast.success("Called Rider Successfully!");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to call rider");
        } finally {
            setLoading(false);
        }
    };

    const handleManualShip = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await shipOrder(orderId, carrier, trackingNumber);
            toast.success("Shipping updated!");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update shipping");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Truck className="h-3 w-3" /> Ship
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Shipment</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button
                        variant={mode === "RIDER" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setMode("RIDER")}
                    >
                        Rider (Lineman)
                    </Button>
                    <Button
                        variant={mode === "SHIPPING" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setMode("SHIPPING")}
                    >
                        Standard Shipping
                    </Button>
                </div>

                {mode === "RIDER" ? (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                            <p><strong>To:</strong> {customerName}</p>
                            <p><strong>Phone:</strong> {customerPhone}</p>
                            <p><strong>Loc:</strong> {deliveryLocation || "No location provided"}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Choose Provider</Label>
                            <Select onValueChange={setCarrier} defaultValue="LINEMAN">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LINEMAN">Lineman Rider</SelectItem>
                                    <SelectItem value="SHOPEE">Shopee Food</SelectItem>
                                    <SelectItem value="GRAB">Grab Express</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAutoShip} disabled={loading} className="w-full">
                            {loading ? "Calling Rider..." : "Call Rider Now"}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleManualShip} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Carrier</Label>
                            <Select onValueChange={setCarrier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Carrier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FLASH">Flash Express</SelectItem>
                                    <SelectItem value="KERRY">Kerry Express</SelectItem>
                                    <SelectItem value="J&T">J&T Express</SelectItem>
                                    <SelectItem value="THAI_POST">Thai Post</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tracking Number</Label>
                            <Input
                                placeholder="TH123456789"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Saving..." : "Confirm Shipment"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
