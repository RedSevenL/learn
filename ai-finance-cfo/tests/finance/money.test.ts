import { describe, expect, it } from "vitest";
import {
  addMoney,
  createMoney,
  divideMoney,
  formatMoney,
  multiplyMoney,
  subtractMoney,
  toMoneyString,
} from "../../lib/finance/money";

describe("Money", () => {
  it("不会出现普通浮点加法误差", () => {
    const result = addMoney("0.1", "0.2");

    expect(result.toString()).toBe("0.3");
    expect(result.toString()).not.toBe("0.30000000000000004");
  });

  it("准确计算小数减法", () => {
    const result = subtractMoney("0.3", "0.1");

    expect(result.toString()).toBe("0.2");
  });

  it("准确计算金额乘法", () => {
    const result = multiplyMoney("19.90", "3");

    expect(result.toString()).toBe("59.7");
  });

  it("准确计算金额除法", () => {
    const result = divideMoney("100", "4");

    expect(result.toString()).toBe("25");
  });

  it("除数为 0 时拒绝计算", () => {
    expect(() => divideMoney("100", "0")).toThrow("除数不能为 0");
  });

  it.each([
    ["10", "10.00"],
    ["59.7", "59.70"],
    ["1.004", "1.00"],
    ["1.005", "1.01"],
    ["-1.005", "-1.01"],
  ])("把 %s 标准化为 %s", (input, expected) => {
    expect(toMoneyString(input)).toBe(expected);
  });

  it("格式化人民币金额", () => {
    expect(formatMoney("1234.5")).toBe("¥1,234.50");
  });

  it("格式化负金额", () => {
    expect(formatMoney("-1500")).toBe("-¥1,500.00");
  });

  it("拒绝非有限金额", () => {
    expect(() => createMoney("NaN")).toThrow("金额必须是有限数字");
    expect(() => createMoney("Infinity")).toThrow("金额必须是有限数字");
  });
});