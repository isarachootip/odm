import { FlexBubble, FlexCarousel, FlexMessage } from "@line/bot-sdk";

function getBaseUrl(): string {
    // Images are uploaded and served by the admin app
    return process.env.ADMIN_URL || "https://admin.mamsoi8.online";
}

// Helper to validate HTTPS URL
function getSafeImageUrl(url: string | null): string {
    const fallback = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60";
    if (!url || typeof url !== 'string') return fallback;

    let targetUrl = url;
    if (url.startsWith('/')) {
        const baseUrl = getBaseUrl();
        if (baseUrl) {
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            targetUrl = `${cleanBase}${url}`;
        } else {
            return fallback;
        }
    }

    try {
        // Ensure URL is valid and HTTPS
        const parsed = new URL(targetUrl);
        const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
        // LINE Max URL Length is 1000
        if ((parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocal)) && parsed.href.length < 1000) {
            return parsed.href;
        }
    } catch (e) {
        // invalid url, return fallback
    }

    return fallback;
}


export interface OptionChoice {
    label: string;
    value: string;
    price?: number;
}

export interface ProductOption {
    id: string;
    label: string;
    type: 'single' | 'multiple';
    required?: boolean;
    choices: OptionChoice[];
}

export interface ProductSpecification {
    options: ProductOption[];
}

export function createCategoryBubble(category: { name: string; image: string | null; count: number }): FlexBubble {
    const safeName = category.name || "หมวดหมู่";
    const safeLabel = safeName.substring(0, 20);
    const safeText = `ดูเมนู ${safeName}`.substring(0, 300); // LINE limit 300
    const safeImage = getSafeImageUrl(category.image);

    return {
        type: "bubble",
        size: "kilo",
        hero: {
            type: "image",
            url: safeImage,
            size: "full",
            aspectMode: "cover",
            aspectRatio: "20:13"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: safeName.substring(0, 100),
                    weight: "bold",
                    size: "sm",
                    wrap: true,
                    align: "center"
                },
                {
                    type: "text",
                    text: `${category.count} รายการ`,
                    size: "xs",
                    color: "#888888",
                    align: "center",
                    margin: "sm"
                }
            ],
            paddingAll: "12px"
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "button",
                    action: {
                        type: "message",
                        label: "ดูเมนู",
                        text: safeText
                    },
                    style: "primary",
                    color: "#EAB308",
                    height: "sm"
                }
            ],
            paddingAll: "12px"
        }
    };
}

export function createProductBubble(product: { id: string; name: string; price: number; image: string | null; specifications?: any }, userId?: string, branchCode?: string): FlexBubble {
    const safeImage = getSafeImageUrl(product.image);

    // Parse specifications if string (JSON) or use as object
    let specs: ProductSpecification | null = null;
    try {
        if (typeof product.specifications === 'string') {
            specs = JSON.parse(product.specifications);
        } else if (typeof product.specifications === 'object') {
            specs = product.specifications;
        }
    } catch (e) {
        // ignore invalid json
    }

    const hasOptions = specs && specs.options && specs.options.length > 0;

    return {
        type: "bubble",
        size: "kilo", // Increased size from micro for better visibility
        hero: {
            type: "image",
            url: safeImage,
            size: "full",
            aspectMode: "cover",
            aspectRatio: "1:1"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: product.name,
                    weight: "bold",
                    size: "md",
                    wrap: true
                },
                {
                    type: "text",
                    text: `${product.price} บาท`,
                    size: "sm",
                    color: "#EAB308",
                    weight: "bold"
                }
            ],
            paddingAll: "12px"
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: hasOptions ? [
                {
                    type: "button",
                    action: {
                        type: "postback",
                        label: "เลือกรายละเอียด",
                        data: `action=select_option&productId=${product.id}&optionIndex=0`,
                        displayText: `สั่ง ${product.name}`
                    },
                    style: "primary",
                    color: "#EAB308",
                    height: "sm"
                }
            ] : [
                {
                    type: "text",
                    text: "Quick Add:",
                    size: "xs",
                    color: "#888888",
                    align: "center",
                    margin: "none"
                },
                {
                    type: "button",
                    action: {
                        type: "postback",
                        label: "ใส่ตะกร้าเลย",
                        data: `action=quick_add&productId=${product.id}`,
                        displayText: `สั่ง ${product.name}`
                    },
                    style: "primary",
                    color: "#EAB308",
                    height: "sm",
                    margin: "md"
                }
            ],
            paddingAll: "10px"
        }
    };
}

export function createCarousel(bubbles: FlexBubble[]): FlexMessage {
    return {
        type: "flex",
        altText: "เลือกรายการสินค้า",
        contents: {
            type: "carousel",
            contents: bubbles
        }
    };
}

export function createOrderTypeSelectionBubble(): FlexMessage {
    // Get current time in Thailand (UTC+7)
    const now = new Date();
    const tzOffset = 7 * 60 * 60 * 1000;
    const localNow = new Date(now.getTime() + tzOffset);
    
    // Format as YYYY-MM-DDTHH:mm
    const year = localNow.getUTCFullYear();
    const month = String(localNow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localNow.getUTCDate()).padStart(2, '0');
    const hours = String(localNow.getUTCHours()).padStart(2, '0');
    const minutes = String(localNow.getUTCMinutes()).padStart(2, '0');
    
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    return {
        type: "flex",
        altText: "เลือกประเภทการสั่งอาหาร",
        contents: {
            type: "bubble",
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    { type: "text", text: "กรุณาเลือกประเภทออเดอร์ค่ะ", weight: "bold", size: "md", align: "center", margin: "md" }
                ]
            },
            footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        style: "primary",
                        color: "#EAB308",
                        action: {
                            type: "postback",
                            label: "🍔 สั่งอาหารปกติ (รับทันที)",
                            data: "action=select_order_type&type=normal",
                            displayText: "สั่งอาหารปกติ"
                        }
                    },
                    {
                        type: "button",
                        style: "secondary",
                        action: {
                            type: "datetimepicker",
                            label: "📅 สั่งจองล่วงหน้า",
                            data: "action=select_order_type&type=preorder",
                            mode: "datetime",
                            initial: minDateTime,
                            min: minDateTime
                        }
                    }
                ]
            }
        }
    };
}

export function createCartBubble(items: any[]): FlexBubble {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create rows for items
    const itemRows = items.map((item, index) => ({
        type: "box",
        layout: "horizontal",
        contents: [
            {
                type: "box",
                layout: "vertical",
                flex: 4,
                contents: [
                    {
                        type: "text",
                        text: `${item.name}`,
                        size: "sm",
                        color: "#555555",
                        wrap: true
                    },
                    {
                        type: "text",
                        text: `${item.price * item.quantity}.-`,
                        size: "xs",
                        color: "#111111",
                        weight: "bold"
                    }
                ]
            },
            {
                type: "box",
                layout: "horizontal",
                flex: 3,
                spacing: "sm",
                alignItems: "center",
                contents: [
                    {
                        type: "button",
                        action: { type: "postback", label: "-", data: `action=decrease&productId=${item.productId}` },
                        style: "secondary",
                        height: "sm",
                        flex: 1
                    },
                    {
                        type: "text",
                        text: `${item.quantity}`,
                        size: "sm",
                        weight: "bold",
                        align: "center",
                        color: "#111111",
                        flex: 1
                    },
                    {
                        type: "button",
                        action: { type: "postback", label: "+", data: `action=increase&productId=${item.productId}` },
                        style: "secondary",
                        height: "sm",
                        flex: 1
                    }
                ]
            }
        ],
        margin: "md",
        alignItems: "center"
    }));

    return {
        type: "bubble",
        size: "mega",
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "🛒 ตะกร้าสินค้า",
                    weight: "bold",
                    color: "#EAB308",
                    size: "lg"
                }
            ],
            backgroundColor: "#FFF9C4"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                ...itemRows,
                {
                    type: "separator",
                    margin: "md"
                },
                {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                        {
                            type: "text",
                            text: "รวมทั้งหมด",
                            weight: "bold",
                            size: "md",
                            flex: 2
                        },
                        {
                            type: "text",
                            text: `${total}.-`,
                            weight: "bold",
                            size: "md",
                            align: "end",
                            flex: 1,
                            color: "#EAB308"
                        }
                    ],
                    margin: "md"
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "button",
                    action: {
                        type: "postback",
                        label: "ยืนยันการสั่งซื้อ",
                        data: "action=checkout",
                        displayText: "ยืนยันการสั่งซื้อ"
                    },
                    style: "primary",
                    color: "#EAB308",
                    height: "sm"
                },
                {
                    type: "button",
                    action: {
                        type: "message",
                        label: "เลือกสินค้าเพิ่ม",
                        text: "เมนู"
                    },
                    style: "secondary",
                    height: "sm",
                    margin: "sm"
                }
            ],
            paddingAll: "12px"
        }
    } as any;
}

export function createQueueTicketBubble(orderId: string, queueNumber: number, total: number, orderNumber?: string | null, queueAhead: number = 0, waitTime: number = 0): FlexBubble {
    return {
        type: "bubble",
        size: "mega",
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "✅ ยืนยันคำสั่งซื้อ",
                    weight: "bold",
                    color: "#FFFFFF",
                    size: "lg",
                    align: "center"
                }
            ],
            backgroundColor: "#1DB446"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "คิวที่",
                    align: "center",
                    color: "#888888",
                    size: "sm"
                },
                {
                    type: "text",
                    text: `${queueNumber}`,
                    weight: "bold",
                    size: "5xl",
                    align: "center",
                    color: "#111111",
                    margin: "md"
                },
                {
                    type: "text",
                    text: `⏳ รออีก ${queueAhead} คิว (~${waitTime} นาที)`,
                    size: "sm",
                    color: "#EAB308",
                    align: "center",
                    weight: "bold",
                    margin: "md"
                },
                {
                    type: "separator",
                    margin: "xl"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "Order ID:", size: "xs", color: "#888888", flex: 1 },
                                { type: "text", text: `#${orderNumber || orderId.slice(-6).toUpperCase()}`, size: "xs", color: "#111111", flex: 2, align: "end" }
                            ]
                        },
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                { type: "text", text: "ยอดชำระ:", size: "xs", color: "#888888", flex: 1 },
                                { type: "text", text: `${Number(total).toFixed(2)} บ.`, size: "xs", color: "#111111", flex: 2, align: "end" }
                            ]
                        }
                    ]
                }
            ],
            paddingAll: "20px"
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "เมื่อได้รับสินค้าแล้ว กดปุ่มด้านล่าง",
                    size: "xxs",
                    color: "#888888",
                    align: "center",
                    margin: "none"
                },
                {
                    type: "button",
                    action: {
                        type: "postback",
                        label: "ได้รับสินค้าแล้ว",
                        data: `action=receive&orderId=${orderId}`,
                        displayText: "ได้รับสินค้าแล้ว"
                    },
                    style: "primary",
                    color: "#1DB446",
                    height: "sm",
                    margin: "md"
                }
            ],
            paddingAll: "12px"
        }
    };
}
// ... existing code ...


export function createOptionBubble(
    productName: string,
    option: ProductOption,
    productId: string,
    nextOptionIndex: number,
    currentSelection: Record<string, string>
): FlexBubble {
    const isMultiple = option.type === 'multiple';

    // Construct base data for postback
    // action=select_option&productId=...&optionIndex=NEXT_INDEX
    const baseData = `action=select_option&productId=${productId}&optionIndex=${nextOptionIndex}`;

    // Serialize current selections to pass through
    let selectionData = "";
    Object.keys(currentSelection).forEach(key => {
        selectionData += `&${key}=${currentSelection[key]}`;
    });

    const buttons: any[] = option.choices.map(choice => {
        let label = choice.label;
        if (choice.price && choice.price > 0) {
            label += ` (+${choice.price}บ.)`;
        }

        return {
            type: "button",
            action: {
                type: "postback",
                label: label,
                // When clicked, we record this selection (s_OPTIONID=VALUE) and move to next index
                data: `${baseData}&s_${option.id}=${choice.value}${selectionData}`,
                displayText: `${choice.label}`
            },
            style: "secondary"
        };
    });

    // If it's optional, add a "Skip / None" button if not already present
    // (Unless the choices already include a "None" option, which is good practice for data design)
    // But for safety, if not required, ensure there's a skip.
    if (!option.required && !option.choices.some(c => c.value === 'none')) {
        buttons.unshift({
            type: "button",
            action: {
                type: "postback",
                label: "ไม่รับ / ข้าม",
                data: `${baseData}&s_${option.id}=none${selectionData}`,
                displayText: "ไม่รับเพิ่ม"
            },
            style: "secondary",
            color: "#888888" // Gray for skip
        });
    }

    return {
        type: "bubble",
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                { type: "text", text: `เลือก ${option.label}`, weight: "bold", size: "lg", color: "#EAB308" }
            ],
            backgroundColor: "#FFF9C4"
        },
        body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: buttons
        }
    };
}

/**
 * Create Rating Prompt Flex Message (Customer Feedback)
 * Shows star rating buttons (1-5) for customer to rate their order
 */
export function createRatingPromptFlexMessage(orderId: string, queueNumber: number): FlexMessage {
    return {
        type: "flex",
        altText: "🌟 ให้คะแนนประสบการณ์ของคุณ",
        contents: {
            type: "bubble",
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "🌟 ให้คะแนนการบริการ",
                        weight: "bold",
                        size: "xl",
                        color: "#1f2937",
                        margin: "md"
                    },
                    {
                        type: "text",
                        text: `คิวที่ #${queueNumber}`,
                        size: "sm",
                        color: "#6b7280",
                        margin: "sm"
                    },
                    {
                        type: "separator",
                        margin: "xl"
                    },
                    {
                        type: "text",
                        text: "ความพึงพอใจของคุณช่วยให้เราพัฒนาบริการได้ดีขึ้น",
                        size: "sm",
                        color: "#6b7280",
                        margin: "lg",
                        wrap: true
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        spacing: "xs",
                        margin: "xl",
                        contents: [
                            {
                                type: "button",
                                action: {
                                    type: "postback",
                                    label: "1⭐",
                                    data: `action=rate&orderId=${orderId}&rating=1`,
                                    displayText: "ให้ 1 ดาว"
                                },
                                style: "secondary",
                                color: "#ef4444",
                                height: "sm"
                            },
                            {
                                type: "button",
                                action: {
                                    type: "postback",
                                    label: "2⭐",
                                    data: `action=rate&orderId=${orderId}&rating=2`,
                                    displayText: "ให้ 2 ดาว"
                                },
                                style: "secondary",
                                color: "#f97316",
                                height: "sm"
                            },
                            {
                                type: "button",
                                action: {
                                    type: "postback",
                                    label: "3⭐",
                                    data: `action=rate&orderId=${orderId}&rating=3`,
                                    displayText: "ให้ 3 ดาว"
                                },
                                style: "secondary",
                                color: "#eab308",
                                height: "sm"
                            },
                            {
                                type: "button",
                                action: {
                                    type: "postback",
                                    label: "4⭐",
                                    data: `action=rate&orderId=${orderId}&rating=4`,
                                    displayText: "ให้ 4 ดาว"
                                },
                                style: "secondary",
                                color: "#84cc16",
                                height: "sm"
                            },
                            {
                                type: "button",
                                action: {
                                    type: "postback",
                                    label: "5⭐",
                                    data: `action=rate&orderId=${orderId}&rating=5`,
                                    displayText: "ให้ 5 ดาว"
                                },
                                style: "primary",
                                color: "#22c55e",
                                height: "sm"
                            }
                        ]
                    }
                ]
            },
            styles: {
                body: {
                    backgroundColor: "#f9fafb"
                }
            }
        }
    };
}

export function createOrderFoodBubble(branchCode?: string): FlexBubble {
    return {
        type: "bubble",
        size: "kilo",
        hero: {
            type: "image",
            url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80", // Food Salad
            size: "full",
            aspectMode: "cover",
            aspectRatio: "20:13",
            action: {
                type: "uri",
                label: "Order Food",
                uri: "https://liff.line.me/2011083072-8BYGcIL4/ecommerce/food"
            }
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "สั่งอาหาร",
                    weight: "bold",
                    size: "xl",
                    color: "#EAB308",
                    align: "center"
                },
                {
                    type: "text",
                    text: "คลิกเพื่อดูเมนูและสั่งซื้อ",
                    size: "xs",
                    color: "#888888",
                    align: "center",
                    margin: "sm"
                }
            ],
            paddingAll: "12px",
            action: {
                type: "uri",
                label: "Order Food",
                uri: "https://liff.line.me/2011083072-8BYGcIL4/ecommerce/food"
            }
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "button",
                    action: {
                        type: "message",
                        label: "ดูเมนูเลย",
                        text: "เมนู"
                    },
                    style: "primary",
                    color: "#EAB308",
                    height: "sm"
                }
            ],
            paddingAll: "12px"
        }
    };
}


