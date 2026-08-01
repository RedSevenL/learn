import { describe, expect, it } from "vitest";
import { parseCsvText } from "@/lib/import/csv-parser";

describe("parseCsvText", () => {
  it("解析标准 CSV", () => {
    const result = parseCsvText(
      "交易日期,金额,备注\n2026-07-01,-36.50,早餐"
    );

    expect(result.fields).toEqual(["交易日期", "金额", "备注"]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]["交易日期"]).toBe("2026-07-01");
    expect(result.rows[0]["金额"]).toBe("-36.50");
  });

  it("保留引号中的逗号", () => {
    const result = parseCsvText(
      [
        "交易日期,金额,交易对象",
        '2026-07-01,-88.00,"便利店,人民广场店"'
      ].join("\n")
    );

    expect(result.rows[0]["交易对象"]).toBe(
      "便利店,人民广场店"
    );
  });

  it("保留引号中的换行", () => {
    const result = parseCsvText(
      '交易日期,金额,备注\n2026-07-01,-120.00,"聚餐\n朋友已转回一半"'
    );

    expect(result.rows[0]["备注"]).toBe(
      "聚餐\n朋友已转回一半"
    );
  });

  it("拒绝没有数据行的文件", () => {
    expect(() =>
      parseCsvText("交易日期,金额")
    ).toThrow("没有可导入的数据行");
  });

  it("拒绝没有表头的文件", () => {
    expect(() =>
      parseCsvText("")
    ).toThrow();
  });

  it("拒绝重复表头", () => {
    expect(() =>
      parseCsvText("金额,金额\n1,2")
    ).toThrow("重复表头");
  });

  it("处理 Windows 换行符", () => {
    const result = parseCsvText(
      "交易日期,金额\r\n2026-07-01,-36.50\r\n2026-07-02,-100.00"
    );

    expect(result.rows).toHaveLength(2);
  });

  it("跳过空行", () => {
    const result = parseCsvText(
      "交易日期,金额\n2026-07-01,-36.50\n\n\n2026-07-02,-100.00"
    );

    expect(result.rows).toHaveLength(2);
  });

  it("移除 UTF-8 BOM", () => {
    const result = parseCsvText(
      "\uFEFF交易日期,金额\n2026-07-01,-36.50"
    );

    expect(result.fields).toEqual(["交易日期", "金额"]);
    expect(result.rows).toHaveLength(1);
  });

  it("检测非 UTF-8 编码", () => {
    expect(() =>
      parseCsvText("\uFFFD")
    ).toThrow("不是 UTF-8 编码");
  });

  it("限制最大行数", () => {
    const header = "a,b\n";
    const rows = Array.from(
      { length: 1001 },
      (_, i) => `${i},${i}`
    ).join("\n");

    expect(() =>
      parseCsvText(header + rows)
    ).toThrow("最多导入");
  });
});