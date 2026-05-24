// Cart Session Helpers for LINE Chatbot
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CartItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
}

export interface TempData {
    name?: string;
    phone?: string;
    deliveryType?: 'PICKUP' | 'DELIVERY';
    location?: string;
}

// Get or create cart session
export async function getCartSession(lineUserId: string) {
    let session = await prisma.cartSession.findUnique({
        where: { lineUserId }
    });

    if (!session) {
        session = await prisma.cartSession.create({
            data: {
                lineUserId,
                items: [],
            }
        });
    }

    return {
        id: session.id,
        lineUserId: session.lineUserId,
        items: (session.items as unknown as CartItem[]) || [],
        state: session.state || null,
        tempData: (session.tempData as TempData) || {},
    };
}

// Add item to cart
export async function addToCart(lineUserId: string, item: CartItem) {
    const session = await getCartSession(lineUserId);

    const existingIndex = session.items.findIndex(i => i.productId === item.productId);

    if (existingIndex >= 0) {
        session.items[existingIndex].quantity += item.quantity;
    } else {
        session.items.push(item);
    }

    await prisma.cartSession.update({
        where: { lineUserId },
        data: { items: session.items as any }
    });

    return session.items;
}

// Clear cart
export async function clearCart(lineUserId: string) {
    await prisma.cartSession.update({
        where: { lineUserId },
        data: {
            items: [],
            state: null,
            tempData: {}
        }
    });
}

// Update conversation state
export async function setState(lineUserId: string, state: string | null) {
    await prisma.cartSession.upsert({
        where: { lineUserId },
        create: {
            lineUserId,
            items: [],
            state
        },
        update: { state }
    });
}

// Update temporary data
export async function updateTempData(lineUserId: string, data: Partial<TempData>) {
    const session = await getCartSession(lineUserId);
    const updatedTempData = { ...session.tempData, ...data };

    await prisma.cartSession.update({
        where: { lineUserId },
        data: { tempData: updatedTempData }
    });

    return updatedTempData;
}

// Get cart total
export function calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
