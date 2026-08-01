import type {
  ChatSuccessData,
} from "@/schemas/chat-response";

export type UserChatMessage = {
  id: string;
  role: "user";
  content: string;
};

export type AssistantChatMessage = {
  id: string;
  role: "assistant";
  content: string;
  result?: ChatSuccessData;
};

export type ChatMessage =
  | UserChatMessage
  | AssistantChatMessage;