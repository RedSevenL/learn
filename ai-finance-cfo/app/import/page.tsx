"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CsvFilePicker,
} from "@/components/import/CsvFilePicker";
import {
  CsvFieldMappingForm,
} from "@/components/import/CsvFieldMappingForm";
import {
  CsvPreviewTable,
} from "@/components/import/CsvPreviewTable";
import {
  CsvImportSummary,
} from "@/components/import/CsvImportSummary";
import { parseCsvText } from "@/lib/import/csv-parser";
import { guessFieldMapping } from "@/lib/import/guess-field-mapping";
import { normalizeCsvRow } from "@/lib/import/normalize-csv-row";
import type { CsvRawRow, CsvFieldMapping, CsvDraftRow } from "@/lib/import/csv-types";
import type { PreviewedCsvRow } from "@/lib/services/csv-import";

// ── 简化响应类型 ─────────────────────────────────

type AccountListResponse = {
  ok: boolean;
  data: {
    accounts: Array<{ id: string; name: string }>;
  };
};

type PreviewResponse = {
  ok: boolean;
  data: {
    rows: PreviewedCsvRow[];
    summary: {
      total: number;
      ready: number;
      duplicate: number;
    };
  };
};

type ConfirmResponse = {
  ok: boolean;
  data: {
    imported: number;
    skipped: number;
  };
};

// ── 页面状态 ──────────────────────────────────────

type Stage = "idle" | "mapping" | "preview" | "done";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

async function readCsvFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("请选择 .csv 文件");
  }

  if (file.size === 0) {
    throw new Error("文件内容为空");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("文件不能超过 2 MB");
  }

  const text = await file.text();
  return parseCsvText(text);
}

export default function ImportPage() {
  const [accounts, setAccounts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [accountId, setAccountId] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<CsvRawRow[]>([]);
  const [mapping, setMapping] = useState<
    Partial<CsvFieldMapping>
  >({});
  const [previewRows, setPreviewRows] = useState<
    PreviewedCsvRow[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<
    Set<number>
  >(new Set());
  const [stage, setStage] = useState<Stage>("idle");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const importLockRef = useRef(false);

  // ── 加载账户 ──────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      try {
        const response = await fetch("/api/accounts");
        const body: unknown = await response.json();
        const parsed = body as AccountListResponse;

        if (
          parsed &&
          typeof parsed === "object" &&
          "ok" in parsed &&
          parsed.ok === true &&
          "data" in parsed &&
          parsed.data &&
          typeof parsed.data === "object" &&
          "accounts" in parsed.data &&
          Array.isArray(parsed.data.accounts)
        ) {
          if (!cancelled) {
            setAccounts(parsed.data.accounts);
          }
        }
      } catch {
        // 静默失败，页面继续渲染
      }
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── 重置状态 ──────────────────────────────────

  function resetImportState() {
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setPreviewRows([]);
    setSelectedRows(new Set());
    setStage("idle");
    setError(null);
    setImportResult(null);
  }

  // ── 文件选择 ──────────────────────────────────

  async function handleFileSelected(file: File) {
    resetImportState();

    try {
      const parsed = await readCsvFile(file);
      setHeaders(parsed.fields);
      setRawRows(parsed.rows);
      setMapping(guessFieldMapping(parsed.fields));
      setStage("mapping");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "无法读取 CSV 文件"
      );
    }
  }

  // ── 生成预览 ──────────────────────────────────

  async function handlePreview() {
    if (!mapping.occurredAt || !mapping.amount) {
      setError("请先映射交易日期和金额");
      return;
    }

    if (!accountId) {
      setError("请先选择目标账户");
      return;
    }

    setIsPreviewing(true);
    setError(null);

    const completeMapping: CsvFieldMapping = {
      occurredAt: mapping.occurredAt,
      amount: mapping.amount,
      direction: mapping.direction,
      category: mapping.category,
      merchant: mapping.merchant,
      note: mapping.note
    };

    // 客户端清洗
    const drafts = rawRows.map((row, index) =>
      normalizeCsvRow({
        row,
        rowNumber: index + 2,
        mapping: completeMapping
      })
    );

    // 提取合法候选
    const candidates = drafts
      .filter((draft) => draft.status === "valid")
      .map((draft) => (draft as Extract<CsvDraftRow, { status: "valid" }>).candidate);

    if (candidates.length === 0) {
      setError("所有行都存在格式错误，无法生成预览");
      setIsPreviewing(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/imports/csv/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            accountId,
            rows: candidates
          })
        }
      );

      const body: unknown = await response.json();
      const parsed = body as PreviewResponse;

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("ok" in parsed) ||
        parsed.ok !== true
      ) {
        throw new Error(
          "预览请求失败，请稍后重试"
        );
      }

      setPreviewRows(parsed.data.rows);

      // 默认选中所有可导入行
      const initialSelection = new Set(
        parsed.data.rows
          .filter((row) => !row.duplicate)
          .map((row) => row.rowNumber)
      );
      setSelectedRows(initialSelection);
      setStage("preview");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "无法完成预览"
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  // ── 行选择 ────────────────────────────────────

  function handleToggleRow(rowNumber: number) {
    setSelectedRows((current) => {
      const next = new Set(current);

      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }

      return next;
    });
  }

  // ── 分类更新 ──────────────────────────────────

  function handleUpdateCategory(
    rowNumber: number,
    category: string
  ) {
    setPreviewRows((current) =>
      current.map((row) =>
        row.rowNumber === rowNumber
          ? { ...row, category }
          : row
      )
    );
  }

  // ── 确认导入 ──────────────────────────────────

  async function handleConfirm() {
    if (importLockRef.current) {
      return;
    }

    importLockRef.current = true;
    setIsImporting(true);
    setError(null);

    try {
      const rowsToImport = previewRows
        .filter(
          (row) =>
            selectedRows.has(row.rowNumber) &&
            !row.duplicate
        )
        .map((row) => ({
          rowNumber: row.rowNumber,
          occurredAt: row.occurredAt,
          amount: row.amount,
          direction: row.direction,
          category: row.category,
          merchant: row.merchant,
          note: row.note,
          rawPayload: row.rawPayload
        }));

      if (rowsToImport.length === 0) {
        setError("没有可导入的行");
        return;
      }

      const response = await fetch(
        "/api/imports/csv/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            accountId,
            rows: rowsToImport
          })
        }
      );

      const body: unknown = await response.json();
      const parsed = body as ConfirmResponse;

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("ok" in parsed) ||
        parsed.ok !== true
      ) {
        throw new Error(
          "导入请求失败，请稍后重试"
        );
      }

      setImportResult({
        imported: parsed.data.imported,
        skipped: parsed.data.skipped
      });
      setStage("done");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "导入失败，请重新生成预览后再试"
      );
    } finally {
      importLockRef.current = false;
      setIsImporting(false);
    }
  }

  // ── 渲染 ──────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Import
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            CSV 导入
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            选择账户和 CSV 账单文件，解析后预览并确认导入。
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* 账户和文件选择 */}
        {(stage === "idle" || stage === "mapping") && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <CsvFilePicker
              accounts={accounts}
              accountId={accountId}
              onAccountChange={(id) => {
                setAccountId(id);
                resetImportState();
              }}
              disabled={
                isPreviewing || isImporting
              }
              onFileSelected={handleFileSelected}
            />

            {stage === "mapping" && (
              <CsvFieldMappingForm
                headers={headers}
                mapping={mapping}
                onMappingChange={setMapping}
                onBack={() => setStage("idle")}
                onPreview={handlePreview}
                disabled={
                  isPreviewing || isImporting
                }
              />
            )}
          </div>
        )}

        {/* 预览表 */}
        {stage === "preview" && (
          <div className="space-y-6">
            <CsvPreviewTable
              rows={previewRows}
              selectedRows={selectedRows}
              onToggleRow={handleToggleRow}
              onUpdateCategory={handleUpdateCategory}
              onBack={() => setStage("mapping")}
              onConfirm={handleConfirm}
              isImporting={isImporting}
              isPreviewing={isPreviewing}
            />
          </div>
        )}

        {/* 导入结果 */}
        {stage === "done" && importResult && (
          <CsvImportSummary
            imported={importResult.imported}
            skipped={importResult.skipped}
            onReset={() => {
              resetImportState();
              setError(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
