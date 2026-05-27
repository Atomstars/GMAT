"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Sparkles } from "lucide-react";
import { useAiStore } from "@/stores";
import { AI_QUICK_ACTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export function AiPanel() {
  const { isOpen, messages, isLoading, context, closeAi, addMessage, setLoading } = useAiStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    
    // Add student message
    const userMsg = { role: "user" as const, content: msg };
    addMessage(userMsg);
    setLoading(true);

    try {
      // Gather latest history (Zustand state updates asynchronously, so include the new msg manually)
      const currentHistory = [...messages, userMsg];

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentHistory,
          context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addMessage({
          role: "assistant",
          content: data.content,
        });
      } else {
        addMessage({
          role: "assistant",
          content: "❌ **Error contacting GMAT AI tutor**\n\nThe server route failed to process your request. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      addMessage({
        role: "assistant",
        content: "❌ **Network connection error**\n\nCould not connect to the GMAT AI server. Check your network or terminal output.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            id="ai-panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAi}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel — premium bottom sheet inside container */}
          <motion.aside
            id="ai-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col"
            style={{
              background: "rgb(var(--bg-surface))",
              borderTop: "1px solid rgb(var(--border))",
              height: "75%",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-app">AI Tutor</p>
                  <p className="text-xs text-muted">Ask anything about this question</p>
                </div>
              </div>
              <button
                id="ai-panel-close"
                onClick={closeAi}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-app transition-colors"
                style={{ background: "rgb(var(--bg-elevated))" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick actions */}
            {messages.length === 0 && (
              <div className="px-4 py-3 border-b border-app flex-shrink-0" style={{ borderColor: "rgb(var(--border))" }}>
                <p className="text-xs text-muted mb-2 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {AI_QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      id={`ai-quick-${action.id}`}
                      onClick={() => handleSend(action.label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 border border-app"
                      style={{
                        background: "rgb(var(--bg-elevated))",
                        borderColor: "rgb(var(--border))",
                        color: "rgb(var(--text-primary))",
                      }}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <Bot size={40} className="text-muted opacity-40" />
                  <p className="text-muted text-sm">Ask me anything about this question,<br />or pick a quick action above.</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                    >
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "text-white rounded-tr-sm"
                        : "text-app rounded-tl-sm"
                    )}
                    style={
                      msg.role === "user"
                        ? { background: "rgb(var(--accent))" }
                        : { background: "rgb(var(--bg-elevated))" }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center"
                  >
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tl-sm"
                    style={{ background: "rgb(var(--bg-elevated))" }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "rgb(var(--text-muted))" }}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 border-t border-app flex-shrink-0"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgb(var(--bg-elevated))" }}
              >
                <input
                  id="ai-panel-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 bg-transparent text-sm text-app placeholder:text-muted outline-none"
                />
                <button
                  id="ai-panel-send"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-200 disabled:opacity-40"
                  style={{ background: "rgb(var(--accent))" }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

