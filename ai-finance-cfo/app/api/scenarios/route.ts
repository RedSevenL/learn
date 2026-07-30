import {
  errorResponse,
  successResponse,
} from "@/lib/api/response";
import {
  calculateWhatIf,
  type WhatIfResult,
} from "@/lib/finance/what-if";
import {
  createScenario,
  listScenarios,
} from "@/lib/services/scenarios";
import { formatZodError } from "@/schemas/format-zod-error";
import { createWhatIfScenarioSchema } from "@/schemas/scenario";

export async function GET() {
  const scenarios = await listScenarios();

  return successResponse({
    scenarios,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createWhatIfScenarioSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "场景输入不合法",
      { status: 400 },
      {
        issues: formatZodError(parsed.error),
      },
    );
  }

  let calculation: WhatIfResult;

  try {
    calculation = calculateWhatIf({
      baseline: parsed.data.baseline,
      changes: parsed.data.changes,
    });
  } catch (error) {
    return errorResponse(
      "SCENARIO_ERROR",
      error instanceof Error ? error.message : "场景计算失败",
      { status: 400 },
    );
  }

  try {
    const scenario = await createScenario(parsed.data);

    return successResponse(
      {
        scenario,
        calculation,
      },
      { status: 201 },
    );
  } catch {
    return errorResponse("SCENARIO_SAVE_ERROR", "场景保存失败", { status: 500 });
  }
}