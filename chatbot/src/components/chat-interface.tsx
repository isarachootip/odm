"use client";

import { useState, useRef, useEffect } from "react";
import { Send, UtensilsCrossed, User, Bot, ShoppingBag } from "lucide-react";
import clsx from "clsx";

interface Message {
    role: "client" | "server";
    message: string; // Kept as string for client messages
    html?: string;   // For server HTML content
    suggestions?: string[]; // For server suggestions
    image?: string | null; // For server image (from Flex Message)
}

export function ChatInterface({ isEmbedded }: { isEmbedded?: boolean } = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        // Add User Message
        const userMessage: Message = { role: "client", message: text };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Send only the necessary history (simplified for token saving if needed, but keeping full for now)
            const apiHistory = messages.map(m => ({
                role: m.role,
                message: m.message || (m.html ? "HTML Content" : "") // Fallback for history log
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: apiHistory,
                    message: text,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setMessages((prev) => [
                    ...prev,
                    { role: "server", message: "ขออภัยค่ะ เกิดข้อผิดพลาด: " + data.error }
                ]);
            } else {
                // Try parsing JSON from AI (it might send markdown wrapped json or just json)
                let parsedResponse;
                try {
                    // Remove markdown code blocks if present
                    const cleanText = data.response.replace(/```json\n?|\n?```/g, "").trim();
                    parsedResponse = JSON.parse(cleanText);

                    // Handle potential nested "response" object from Gemini 2.0
                    if (parsedResponse.response && parsedResponse.response.html) {
                        parsedResponse = parsedResponse.response;
                    }
                } catch (e) {
                    // Fallback if not JSON
                    parsedResponse = { html: `<p>${data.response}</p>`, suggestions: [] };
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "server",
                        message: "",
                        html: parsedResponse.html || (parsedResponse.text ? `<p>${parsedResponse.text}</p>` : ""), // Prefer HTML, fallback to text
                        suggestions: parsedResponse.suggestions || [],
                        // EXTRACT IMAGE FROM FLEX MESSAGE (Specific logic for our Gemini prompt structure)
                        image: parsedResponse.flex?.contents?.[0]?.hero?.url || null
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "server", message: "ไม่สามารถเชื่อมต่อได้ค่ะ" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const onSendClick = () => handleSendMessage(inputValue);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendClick();
        }
    };

    // Mobile Viewport Height Fix (Use Fixed Positioning instead of calc)
    // Removed JS calc to rely on CSS fixed inset which is more robust in LINE Browser

    return (
        <div className="fixed inset-0 flex flex-col w-full max-w-md mx-auto bg-gray-50 border-x border-gray-200 shadow-xl overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-[#FFC107] text-gray-800 p-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-sm bg-white">
                        <img src="/nong-enjoy.png" alt="Nong Enjoy" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Odm Vidwa</h1>
                        <p className="text-xs text-gray-700">ตอบกลับทันที • Nong Enjoy</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
                    <ShoppingBag className="w-6 h-6 text-gray-800" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#FFC107]"></span>
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#FFF9E6]">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 animate-fade-in">
                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md border-2 border-white ring-4 ring-[#FFC107]/20 bg-white">
                            <img src="/nong-enjoy.png" alt="Nong Enjoy" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-gray-600 font-medium">สวัสดีค่ะ น้อง enjoy ยินดีให้บริการค่ะ 👩‍🍳</p>
                        <p className="text-sm text-gray-400 mt-1">Odm Vidwa ยินดีต้อนรับค่ะ 🥐☕</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={clsx("flex flex-col w-full animate-slide-up", msg.role === "client" ? "items-end" : "items-start")}>

                        <div className={clsx("flex max-w-[85%]", msg.role === "client" ? "flex-row-reverse" : "flex-row")}>
                            {/* Avatar */}
                            {msg.role === "server" && (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2 border border-white shadow-sm self-start mt-1 bg-white">
                                    <img src="/nong-enjoy.png" alt="Nong Enjoy" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div
                                className={clsx(
                                    "p-3 shadow-sm text-sm leading-relaxed overflow-hidden",
                                    msg.role === "client"
                                        ? "bg-[#FFC107] text-gray-900 rounded-2xl rounded-tr-none font-medium"
                                        : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100"
                                )}
                            >
                                {/* Simple text rendering */}
                                <p className="whitespace-pre-wrap">{msg.html || msg.message}</p>

                                {/* Image Display (from Flex Message) */}
                                {msg.role === "server" && msg.image && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                        <img
                                            src={msg.image}
                                            alt="Menu Item"
                                            className="w-full h-auto object-cover max-h-48"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'; // Hide broken images
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggestions Chips (Only for server messages) */}
                        {msg.role === "server" && msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 ml-10">
                                {msg.suggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(sug)}
                                        className="bg-white border border-[#FFC107] text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-[#FFC107] hover:text-gray-900 transition-all shadow-sm active:scale-95"
                                    >
                                        {sug}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2 border border-white shadow-sm mt-1 bg-white">
                            <img src="/nong-enjoy.png" alt="Nong Enjoy" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-1.5 h-10">
                            <span className="w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-100 flex items-center gap-2 pb-safe">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="ถามเมนูหรือสั่งกาแฟได้เลย..."
                    className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50 transition-all text-sm placeholder:text-gray-400"
                    disabled={isLoading}
                />
                <button
                    onClick={onSendClick}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 bg-[#FFC107] text-gray-900 rounded-full hover:bg-[#FFD54F] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
