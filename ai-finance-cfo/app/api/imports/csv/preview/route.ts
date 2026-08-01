import { errorResponse, successResponse } from "@/lib/api/response";
import { getAccountById } from "@/lib/services/accounts";
import { previewCsvImport } from "@/lib/services/csv-import";
import { csvImportRequestSchema } from "@/schemas/csv-import";
import { formatZodError } from "@/schemas/format-zod-error";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "请求体不是合法 JSON",
      { status: 400 }
    );
  }

  const result = csvImportRequestSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "导入数据不合法",
      { status: 400 },
      { issues: formatZodError(result.error) }
    );
  }

  const account = await getAccountById(result.data.accountId);

  if (!account) {
    return errorResponse(
      "ACCOUNT_NOT_FOUND",
      "账户不存在或已删除",
      { status: 404 }
    );
  }

  const rows = await previewCsvImport(result.data);

  return successResponse({
    rows,
    summary: {
      total: rows.length,
      ready: rows.filter((row) => !row.duplicate).length,
      duplicate: rows.filter((row) => row.duplicate).length
    }
  });
}