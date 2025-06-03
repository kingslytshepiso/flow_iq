"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("aiChat.welcome"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Implement actual AI API call here
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          role: "assistant",
          content: t("aiChat.error"),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {t("aiChat.title")}
        </h1>
        <p className="text-[var(--text)]/70">{t("aiChat.description")}</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--card)] border border-[var(--border)]"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 border-t border-[var(--border)]">
          <h3 className="text-sm font-medium mb-3">
            {t("aiChat.suggestions.title")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                handleSuggestionClick(t("aiChat.suggestions.sales"))
              }
              className="bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors"
            >
              {t("aiChat.suggestions.sales")}
            </button>
            <button
              onClick={() =>
                handleSuggestionClick(t("aiChat.suggestions.inventory"))
              }
              className="bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors"
            >
              {t("aiChat.suggestions.inventory")}
            </button>
            <button
              onClick={() =>
                handleSuggestionClick(t("aiChat.suggestions.cashflow"))
              }
              className="bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors"
            >
              {t("aiChat.suggestions.cashflow")}
            </button>
            <button
              onClick={() =>
                handleSuggestionClick(t("aiChat.suggestions.trends"))
              }
              className="bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors"
            >
              {t("aiChat.suggestions.trends")}
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 border-t border-[var(--border)]"
      >
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("aiChat.placeholder")}
            className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("aiChat.send")}
          </button>
        </div>
      </form>
    </div>
  );
}
