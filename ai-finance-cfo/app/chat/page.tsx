"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ChatComposer,
} from "@/components/chat/ChatComposer";
import {
  ChatMessageList,
} from "@/components/chat/ChatMessageList";
import {
  getChatErrorMessage,
} from "@/lib/chat/get-chat-error-message";
import {
  chatExamples,
} from "@/lib/mock-data";
import {
  chatApiResponseSchema,
} from "@/schemas/chat-response";
import type {
  ChatMessage,
} from "@/types/chat";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "你好，我是你的 AI 个人财务 CFO。" +
      "当前版本可以帮你分析储蓄目标，" +
      "金额结果会由确定性计算函数生成。",
  },
];

class ChatPageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatPageError";
  }
}

async function readChatResponse(
  response: Response,
) {
  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new ChatPageError(
      "服务器返回了无法读取的响应。",
    );
  }

  const parsed =
    chatApiResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new ChatPageError(
      "服务器返回的数据结构不符合预期。",
    );
  }

  if (!response.ok || !parsed.data.ok) {
    if (!parsed.data.ok) {
      throw new ChatPageError(
        getChatErrorMessage(parsed.data.error),
      );
    }

    throw new ChatPageError(
      "聊天请求处理失败，请稍后重试。",
    );
  }

  return parsed.data.data;
}

export default function ChatPage() {
  const [messages, setMessages] =
    useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [question, setQuestion] =
    useState("");
  const [error, setError] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);
  const submissionLockRef =
    useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSubmitting]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    const submittedQuestion = question.trim();

    if (!submittedQuestion) {
      setError("请输入一个财务问题。");
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setError("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: submittedQuestion,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);
    setQuestion("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: submittedQuestion,
        }),
      });

      const result =
        await readChatResponse(response);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        result,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof ChatPageError
          ? caughtError.message
          : "无法连接服务器，请稍后重试。",
      );

      setQuestion((current) =>
        current.length === 0
          ? submittedQuestion
          : current,
      );
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Chat
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            AI 财务对话
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            用自然语言提出储蓄目标问题。
            AI 负责理解问题，金额结果由确定性计算函数生成。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
          <div className="min-w-0">
            <ChatMessageList
              messages={messages}
              isSubmitting={isSubmitting}
              endRef={messagesEndRef}
            />

            <ChatComposer
              question={question}
              onQuestionChange={(value) => {
                setQuestion(value);

                if (error) {
                  setError("");
                }
              }}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          </div>

          <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              示例问题
            </h2>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              当前版本支持储蓄目标问题。
              点击后可以继续修改。
            </p>

            <div className="mt-4 space-y-3">
              {chatExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setQuestion(example);
                    setError("");
                  }}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}