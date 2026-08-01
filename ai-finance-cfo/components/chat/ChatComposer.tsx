import type {
  FormEvent,
  KeyboardEvent,
} from "react";

type ChatComposerProps = {
  question: string;
  onQuestionChange(value: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
  isSubmitting: boolean;
  error: string;
};

export function ChatComposer({
  question,
  onQuestionChange,
  onSubmit,
  isSubmitting,
  error,
}: ChatComposerProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <label
        htmlFor="chat-question"
        className="text-sm font-medium text-gray-800"
      >
        输入你的财务问题
      </label>

      <textarea
        id="chat-question"
        name="question"
        value={question}
        onChange={(event) =>
          onQuestionChange(event.target.value)
        }
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        maxLength={500}
        rows={3}
        placeholder="例如：我两年内能攒够 50 万吗？"
        className="mt-2 w-full resize-y rounded-md border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-gray-500 disabled:bg-gray-100"
      />

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          Enter 发送，Shift+Enter 换行
        </p>
        <p className="text-xs text-gray-400">
          {question.length}/500
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting ||
          question.trim().length === 0
        }
        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "正在分析……"
          : "发送问题"}
      </button>
    </form>
  );
}