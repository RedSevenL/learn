import type {
  RefObject,
} from "react";
import type {
  ChatMessage,
} from "@/types/chat";
import {
  ChatCalculationCard,
} from "./ChatCalculationCard";

export function ChatMessageList({
  messages,
  isSubmitting,
  endRef,
}: {
  messages: ChatMessage[];
  isSubmitting: boolean;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      aria-label="聊天消息"
      className="min-h-[28rem] rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <ol className="space-y-5">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <li
              key={message.id}
              className={
                isUser
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <article
                className={
                  isUser
                    ? "max-w-[85%] rounded-lg bg-gray-900 px-4 py-3 text-white"
                    : "max-w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800 sm:max-w-[92%]"
                }
              >
                <p
                  className={
                    isUser
                      ? "text-xs font-medium text-gray-300"
                      : "text-xs font-medium text-gray-500"
                  }
                >
                  {isUser ? "你" : "AI 财务 CFO"}
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                  {message.content}
                </p>

                {message.role === "assistant" &&
                  message.result && (
                    <ChatCalculationCard
                      result={message.result}
                    />
                  )}
              </article>
            </li>
          );
        })}

        {isSubmitting && (
          <li className="flex justify-start">
            <article
              aria-live="polite"
              className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600"
            >
              <p className="text-xs font-medium text-gray-500">
                AI 财务 CFO
              </p>
              <p className="mt-1">
                正在理解问题并计算，请稍候……
              </p>
            </article>
          </li>
        )}
      </ol>

      <div ref={endRef} />
    </section>
  );
}