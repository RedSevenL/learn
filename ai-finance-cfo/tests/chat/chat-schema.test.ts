import { describe, expect, it } from "vitest";
import { chatRequestSchema } from "../../schemas/chat";

describe("chatRequestSchema", () => {
  it("接受合法问题", () => {
    const result = chatRequestSchema.safeParse({
      question: "我两年内能攒够 50 万吗？",
    });

    expect(result.success).toBe(true);
  });

  it("拒绝空问题", () => {
    const result = chatRequestSchema.safeParse({
      question: "",
    });

    expect(result.success).toBe(false);
  });

  it("拒绝纯空格问题", () => {
    const result = chatRequestSchema.safeParse({
      question: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("拒绝超长问题", () => {
    const result = chatRequestSchema.safeParse({
      question: "a".repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it("拒绝多余字段", () => {
    const result = chatRequestSchema.safeParse({
      question: "我两年内能攒够 50 万吗？",
      extraField: "不该存在",
    });

    expect(result.success).toBe(false);
  });

  it("拒绝非字符串 question", () => {
    const result = chatRequestSchema.safeParse({
      question: 123,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝空对象", () => {
    const result = chatRequestSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});