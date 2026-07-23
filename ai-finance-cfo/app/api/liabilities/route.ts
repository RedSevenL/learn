import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createLiability,
  listLiabilities
} from "@/lib/services/liabilities";
import { formatZodError } from "@/schemas/format-zod-error";
import { createLiabilitySchema } from "@/schemas/finance";

export async function GET() {
  const liabilities = await listLiabilities();

  return successResponse({
    liabilities
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createLiabilitySchema.safeParse(body);

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

  const liability = await createLiability(result.data);

  return successResponse(
    {
      liability
    },
    { status: 201 }
  );
}

