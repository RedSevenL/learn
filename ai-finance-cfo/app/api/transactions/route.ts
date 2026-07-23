import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createTransaction,
  listTransactions
} from "@/lib/services/transactions";
import { formatZodError } from "@/schemas/format-zod-error";
import { createTransactionSchema } from "@/schemas/finance";

export async function GET() {
  const transactions = await listTransactions();

  return successResponse({
    transactions
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createTransactionSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "请求数据不合法",
      { status: 400 },
      {
        issues: formatZodError(result.error)
      }
    );
  }

  const transaction = await createTransaction(result.data);

  return successResponse(
    {
      transaction
    },
    { status: 201 }
  );
}