// Flex Message Templates for LINE Cart System
import { FlexMessage, FlexBubble, FlexCarousel } from '@line/bot-sdk';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    categoryId: string;
}

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

// Product Carousel - Show products in a category
export function createProductCarousel(products: Product[]): FlexMessage {
    const bubbles: FlexBubble[] = products.map(product => ({
        type: 'bubble',
        size: 'micro',
        hero: {
            type: 'image',
            url: product.images[0] || 'https://via.placeholder.com/300x200?text=No+Image',
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover'
        },
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: product.name,
                    weight: 'bold',
                    size: 'sm',
                    wrap: true,
                    maxLines: 2
                },
                {
                    type: 'box',
                    layout: 'baseline',
                    margin: 'md',
                    contents: [
                        {
                            type: 'text',
                            text: `฿${product.price}`,
                            size: 'xl',
                            color: '#EAB308',
                            weight: 'bold',
                            flex: 0
                        }
                    ]
                }
            ],
            spacing: 'sm',
            paddingAll: '13px'
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
                {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    action: {
                        type: 'postback',
                        label: '🛒 เพิ่มลงตะกร้า',
                        data: `action=add&productId=${product.id}`,
                        displayText: `เพิ่ม ${product.name} ลงตะกร้า`
                    },
                    color: '#EAB308'
                }
            ],
            flex: 0
        }
    }));

    return {
        type: 'flex',
        altText: 'เมนูสินค้า',
        contents: {
            type: 'carousel',
            contents: bubbles
        }
    };
}

// Cart Summary - Show items in cart
export function createCartSummary(items: CartItem[], total: number): FlexMessage {
    const itemContents = items.map(item => ({
        type: 'box' as const,
        layout: 'horizontal' as const,
        contents: [
            {
                type: 'text' as const,
                text: `${item.name} x${item.quantity}`,
                size: 'sm',
                color: '#555555',
                flex: 5
            },
            {
                type: 'text' as const,
                text: `฿${item.price * item.quantity}`,
                size: 'sm',
                color: '#111111',
                align: 'end' as const,
                flex: 1
            }
        ],
        margin: 'md'
    }));

    const bubble: FlexBubble = {
        type: 'bubble',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '🛒 ตะกร้าของคุณ',
                    weight: 'bold',
                    size: 'xl',
                    color: '#1DB446'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'lg',
                    spacing: 'sm',
                    contents: itemContents
                },
                {
                    type: 'separator',
                    margin: 'xl'
                },
                {
                    type: 'box',
                    layout: 'horizontal',
                    margin: 'xl',
                    contents: [
                        {
                            type: 'text',
                            text: 'รวมทั้งหมด',
                            size: 'lg',
                            weight: 'bold',
                            color: '#555555',
                            flex: 5
                        },
                        {
                            type: 'text',
                            text: `฿${total}`,
                            size: 'xl',
                            weight: 'bold',
                            color: '#EAB308',
                            align: 'end',
                            flex: 1
                        }
                    ]
                }
            ]
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
                {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    action: {
                        type: 'postback',
                        label: '✅ ยืนยันคำสั่งซื้อ',
                        data: 'action=checkout',
                        displayText: 'ยืนยันคำสั่งซื้อ'
                    },
                    color: '#EAB308'
                },
                {
                    type: 'button',
                    style: 'link',
                    height: 'sm',
                    action: {
                        type: 'postback',
                        label: '🗑️ ล้างตะกร้า',
                        data: 'action=clear_cart',
                        displayText: 'ล้างตะกร้า'
                    }
                }
            ],
            flex: 0
        }
    };

    return {
        type: 'flex',
        altText: 'ตะกร้าของคุณ',
        contents: bubble
    };
}

// Order Confirmation - Final summary before creating order
export function createOrderConfirmation(
    items: CartItem[],
    total: number,
    customerName: string,
    customerPhone: string,
    deliveryType: 'PICKUP' | 'DELIVERY',
    deliveryLocation?: string
): FlexMessage {
    const itemContents = items.map(item => ({
        type: 'box' as const,
        layout: 'horizontal' as const,
        contents: [
            {
                type: 'text' as const,
                text: `${item.name} x${item.quantity}`,
                size: 'sm',
                color: '#555555',
                flex: 5
            },
            {
                type: 'text' as const,
                text: `฿${item.price * item.quantity}`,
                size: 'sm',
                color: '#111111',
                align: 'end' as const,
                flex: 1
            }
        ]
    }));

    const deliveryInfo = deliveryType === 'DELIVERY' && deliveryLocation
        ? [
            {
                type: 'box' as const,
                layout: 'baseline' as const,
                spacing: 'sm',
                contents: [
                    {
                        type: 'text' as const,
                        text: 'สถานที่:',
                        color: '#aaaaaa',
                        size: 'sm',
                        flex: 2
                    },
                    {
                        type: 'text' as const,
                        text: deliveryLocation,
                        wrap: true,
                        color: '#666666',
                        size: 'sm',
                        flex: 5
                    }
                ]
            }
        ]
        : [];

    const bubble: FlexBubble = {
        type: 'bubble',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '📋 สรุปคำสั่งซื้อ',
                    weight: 'bold',
                    size: 'xl',
                    color: '#1DB446'
                },
                {
                    type: 'separator',
                    margin: 'lg'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'lg',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'box',
                            layout: 'baseline',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ชื่อ:',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: customerName,
                                    wrap: true,
                                    color: '#666666',
                                    size: 'sm',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'baseline',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'เบอร์:',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: customerPhone,
                                    wrap: true,
                                    color: '#666666',
                                    size: 'sm',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'baseline',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ประเภท:',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: deliveryType === 'PICKUP' ? '🏃 รับเอง' : '🚗 จัดส่ง',
                                    wrap: true,
                                    color: '#666666',
                                    size: 'sm',
                                    flex: 5
                                }
                            ]
                        },
                        ...deliveryInfo
                    ]
                },
                {
                    type: 'separator',
                    margin: 'lg'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'lg',
                    spacing: 'sm',
                    contents: itemContents
                },
                {
                    type: 'separator',
                    margin: 'lg'
                },
                {
                    type: 'box',
                    layout: 'horizontal',
                    margin: 'lg',
                    contents: [
                        {
                            type: 'text',
                            text: 'รวมทั้งหมด',
                            size: 'lg',
                            weight: 'bold',
                            color: '#555555',
                            flex: 5
                        },
                        {
                            type: 'text',
                            text: `฿${total}`,
                            size: 'xl',
                            weight: 'bold',
                            color: '#EAB308',
                            align: 'end',
                            flex: 1
                        }
                    ]
                }
            ]
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
                {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    action: {
                        type: 'postback',
                        label: '✅ ยืนยันสั่งซื้อ',
                        data: 'action=confirm_order',
                        displayText: 'ยืนยันสั่งซื้อ'
                    },
                    color: '#06C755'
                },
                {
                    type: 'button',
                    style: 'link',
                    height: 'sm',
                    action: {
                        type: 'message',
                        label: '❌ ยกเลิก',
                        text: 'ยกเลิก'
                    }
                }
            ],
            flex: 0
        }
    };

    return {
        type: 'flex',
        altText: 'สรุปคำสั่งซื้อ',
        contents: bubble
    };
}

// Order Success - Show after order is created
export function createOrderSuccess(queueNumber: number, total: number): FlexMessage {
    const bubble: FlexBubble = {
        type: 'bubble',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '✅',
                            size: '5xl',
                            align: 'center'
                        }
                    ]
                },
                {
                    type: 'text',
                    text: 'สั่งซื้อสำเร็จ!',
                    weight: 'bold',
                    size: 'xl',
                    align: 'center',
                    color: '#06C755',
                    margin: 'md'
                },
                {
                    type: 'separator',
                    margin: 'xl'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'xl',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'คิวของคุณ',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 0
                                },
                                {
                                    type: 'text',
                                    text: `#${queueNumber}`,
                                    size: '3xl',
                                    weight: 'bold',
                                    color: '#EAB308',
                                    align: 'center',
                                    flex: 1
                                }
                            ]
                        },
                        {
                            type: 'separator',
                            margin: 'lg'
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            margin: 'lg',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ยอดชำระ',
                                    size: 'sm',
                                    color: '#555555'
                                },
                                {
                                    type: 'text',
                                    text: `฿${total}`,
                                    size: 'lg',
                                    weight: 'bold',
                                    color: '#111111',
                                    align: 'end'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'separator',
                    margin: 'xl'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'xl',
                    contents: [
                        {
                            type: 'text',
                            text: 'ขอบคุณที่ใช้บริการค่ะ 🙏',
                            size: 'sm',
                            color: '#aaaaaa',
                            align: 'center'
                        },
                        {
                            type: 'text',
                            text: 'เราจะแจ้งเตือนเมื่อคิวของคุณพร้อม',
                            size: 'xs',
                            color: '#aaaaaa',
                            align: 'center',
                            margin: 'sm'
                        }
                    ]
                }
            ]
        }
    };

    return {
        type: 'flex',
        altText: `✅ สั่งซื้อสำเร็จ! คิว #${queueNumber}`,
        contents: bubble
    };
}
