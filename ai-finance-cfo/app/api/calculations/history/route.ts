import { successResponse } from "@/lib/api/response";
import { listCalculationHistory } from "@/lib/services/calculation-history";

export async function GET() {
  const histories = await listCalculationHistory();

  return successResponse({
    histories,
  });
}