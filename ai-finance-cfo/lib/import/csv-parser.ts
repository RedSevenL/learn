import Papa from "papaparse";
import type { CsvRawRow } from "@/lib/import/csv-types";

const MAX_CSV_ROWS = 1000;

export type ParsedCsv = {
  fields: string[];
  rows: CsvRawRow[];
};

export function parseCsvText(text: string): ParsedCsv {
  if (text.includes("\uFFFD")) {
    throw new Error("文件可能不是 UTF-8 编码，请转换编码后重试");
  }

  const result = Papa.parse<CsvRawRow>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim()
  });

  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    const rowLabel =
      typeof firstError.row === "number"
        ? `第 ${firstError.row + 2} 行`
        : "未知行";

    throw new Error(
      `CSV ${rowLabel}无法解析：${firstError.message}`
    );
  }

  const fields = result.meta.fields ?? [];

  if (fields.length === 0) {
    throw new Error("CSV 缺少表头");
  }

  const renamedHeaders = result.meta.renamedHeaders ?? {};

  if (Object.keys(renamedHeaders).length > 0) {
    const firstOriginalHeader =
      Object.values(renamedHeaders)[0];
    throw new Error(`CSV 存在重复表头：${firstOriginalHeader}`);
  }

  if (result.data.length === 0) {
    throw new Error("CSV 没有可导入的数据行");
  }

  if (result.data.length > MAX_CSV_ROWS) {
    throw new Error(`单次最多导入 ${MAX_CSV_ROWS} 行`);
  }

  return {
    fields,
    rows: result.data
  };
}
