"use client";

import { useState, useRef, useEffect } from "react";
import { Send, FileText, User, Bot, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Detective online. I have reviewed the case files. What would you like to know?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Connection error. Unable to access case files." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
            {/* Sidebar / Case Files Visual */}
            <div className="hidden md:flex w-80 flex-col border-r border-slate-800 bg-slate-900/50 p-6">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Search className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-wide text-slate-100">COLD CASE</h1>
                        <p className="text-xs text-cyan-400 font-mono tracking-wider">RAG SYSTEM V1.0</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Evidence Loaded</h2>
                    {["witness_statement.txt", "forensic_report.txt", "police_log.txt"].map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                            <span className="text-sm text-slate-300 font-mono">{file}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto">
                    <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl">
                        <p className="text-xs text-cyan-400/80 leading-relaxed">
                            System is restricted to answering based ONLY on provided evidence. All sources will be cited.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

                {/* Header (Mobile) */}
                <div className="md:hidden p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                    <Search className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-slate-100">Cold Case Detective</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={clsx(
                                    "flex gap-4 max-w-3xl mx-auto",
                                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-1",
                                    m.role === "user"
                                        ? "bg-slate-700 ring-slate-600"
                                        : "bg-cyan-950 ring-cyan-500/50"
                                )}>
                                    {m.role === "user"
                                        ? <User className="w-4 h-4 text-slate-300" />
                                        : <Bot className="w-4 h-4 text-cyan-400" />
                                    }
                                </div>

                                <div className={clsx(
                                    "flex flex-col gap-1 p-4 rounded-2xl shadow-sm border text-sm md:text-base leading-relaxed whitespace-pre-wrap",
                                    m.role === "user"
                                        ? "bg-slate-800 border-slate-700 text-slate-100 rounded-tr-sm"
                                        : "bg-slate-900/80 border-slate-800 text-slate-300 rounded-tl-sm shadow-xl backdrop-blur-sm"
                                )}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4 max-w-3xl mx-auto"
                        >
                            <div className="w-8 h-8 rounded-full bg-cyan-950 ring-1 ring-cyan-500/50 flex items-center justify-center shrink-0 pb-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                </span>
                            </div>
                            <div className="text-xs text-cyan-500/70 font-mono animate-pulse pt-2">
                                ANALYZING EVIDENCE...
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the evidence..."
                            className="w-full bg-slate-900/50 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-2 p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest">Confidential Case File #49281</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
