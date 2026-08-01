import {
  errorResponse,
  successResponse,
} from "@/lib/api/response";
import { listCalculationHistory } from "@/lib/services/calculation-history";

export async function GET() {
  try {
    const histories = await listCalculationHistory();

    return successResponse({
      histories,
    });
  } catch {
    return errorResponse(
      "CALCULATION_HISTORY_LOAD_FAILED",
      "计算历史加载失败，请稍后重试",
      { status: 500 },
    );
  }
}
