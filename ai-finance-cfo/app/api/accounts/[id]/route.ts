import { errorResponse, successResponse } from "@/lib/api/response";
import { deleteAccount, updateAccount } from "@/lib/services/accounts";
import { formatZodError } from "@/schemas/format-zod-error";
import { updateAccountSchema } from "@/schemas/finance";

type AccountRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: AccountRouteContext
) {
  const { id } = await context.params;
  const body = await request.json();
  const result = updateAccountSchema.safeParse(body);

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

  const account = await updateAccount(id, result.data);

  if (!account) {
    return errorResponse("ACCOUNT_NOT_FOUND", "账户不存在", {
      status: 404
    });
  }

  return successResponse({
    account
  });
}

export async function DELETE(
  _request: Request,
  context: AccountRouteContext
) {
  const { id } = await context.params;
  const deleted = await deleteAccount(id);

  if (!deleted) {
    return errorResponse("ACCOUNT_NOT_FOUND", "账户不存在", {
      status: 404
    });
  }

  return successResponse({
    deleted: true
  });
}