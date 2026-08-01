import { describe, expect, it } from "vitest";
import { inferCategory } from "@/lib/import/infer-category";

describe("inferCategory", () => {
  it("优先保留 CSV 原分类", () => {
    expect(
      inferCategory({
        category: "自定义分类",
        merchant: "早餐店"
      })
    ).toEqual({
      category: "自定义分类",
      source: "csv"
    });
  });

  it("根据商户建议分类", () => {
    expect(
      inferCategory({
        merchant: "中国移动"
      }).category
    ).toBe("通讯");
  });

  it("根据备注建议分类", () => {
    expect(
      inferCategory({
        note: "美团外卖订单"
      }).category
    ).toBe("餐饮");
  });

  it("没有命中时返回未分类", () => {
    expect(
      inferCategory({
        merchant: "未知商户"
      }).category
    ).toBe("未分类");
  });

  it("分类为空字符串时使用规则", () => {
    expect(
      inferCategory({
        category: "",
        merchant: "盒马鲜生"
      }).category
    ).toBe("购物");
  });
});