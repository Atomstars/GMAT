"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, BookOpen, BarChart3, Target, Lightbulb } from "lucide-react";
import { useAiStore, useTimeStore } from "@/stores";
import { useTimeTracker } from "@/hooks/useTimeTracker";

const SUGGESTED = [
  { icon: BookOpen, text: "Explain Data Sufficiency strategy" },
  { icon: Target, text: "What are my weakest topics?" },
  { icon: BarChart3, text: "Help me understand RC inference questions" },
  { icon: Lightbulb, text: "Give me tips for time management in GMAT" },
];

export default function AiTutorPage() {
  const { messages, isLoading, addMessage, setLoading } = useAiStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { endSession } = useTimeStore();

  useTimeTracker({
    activityType: "ai-tutor",
    onSessionEnd: (s, a) => endSession(s, a),
  });

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
      const currentHistory = [...messages, userMsg];

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentHistory,
          context: null, // Standalone AI page has no active question context
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
    <div className="flex flex-col h-dvh md:h-[calc(100dvh)] pb-20 md:pb-0">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-app flex items-center gap-3 flex-shrink-0"
        style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
      >
        <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-app">AI Tutor</h1>
          <p className="text-xs text-muted">GMAT Focus expert · Always available</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-6">
            <div className="text-center pt-6">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-3">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-app mb-1">Your GMAT AI Tutor</h2>
              <p className="text-sm text-muted leading-relaxed">
                Ask me anything — concepts, strategies, question walkthroughs, study plans.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3 text-center">Try asking</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    id={`ai-suggest-${text.slice(0, 10)}`}
                    onClick={() => handleSend(text)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-app border border-app text-left transition-all hover:scale-[1.01]"
                    style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
                  >
                    <Icon size={16} style={{ color: "rgb(var(--accent))" }} />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "text-white rounded-tr-sm" : "text-app rounded-tl-sm"}`}
              style={msg.role === "user" ? { background: "rgb(var(--accent))" } : { background: "rgb(var(--bg-elevated))" }}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "rgb(var(--bg-elevated))" }}>
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
        style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
      >
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgb(var(--bg-elevated))" }}>
          <input
            id="ai-tutor-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask your GMAT tutor..."
            className="flex-1 bg-transparent text-sm text-app placeholder:text-muted outline-none"
          />
          <button
            id="ai-tutor-send"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all"
            style={{ background: "rgb(var(--accent))" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
