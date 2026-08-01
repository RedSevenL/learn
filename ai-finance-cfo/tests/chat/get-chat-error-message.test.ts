import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getChatErrorMessage,
} from "../../lib/chat/get-chat-error-message";

describe("getChatErrorMessage", () => {
  it("优先展示校验问题", () => {
    expect(
      getChatErrorMessage({
        code: "VALIDATION_ERROR",
        message: "聊天请求不合法",
        issues: [
          {
            path: "question",
            message: "问题不能为空",
          },
        ],
      }),
    ).toBe("问题不能为空");
  });

  it("未知错误使用安全兜底文案", () => {
    expect(
      getChatErrorMessage({
        code: "UNKNOWN",
        message: "内部详细错误",
      }),
    ).toBe(
      "聊天请求处理失败，请稍后重试。",
    );
  });
});