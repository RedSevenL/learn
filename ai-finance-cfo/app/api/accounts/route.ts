import { initialAccounts } from "@/lib/mock-data";
import { createAccountSchema } from "@/schemas/finance";
import { formatZodError } from "@/schemas/format-zod-error";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const shouldFail = url.searchParams.get("fail") === "1";
  
    if (shouldFail) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "ACCOUNTS_LOAD_FAILED",
            message: "账户数据读取失败"
          }
        },
        { status: 500 }
      );
    }
  
    return Response.json({
      ok: true,
      data: {
        accounts: initialAccounts
      }
    });
  }

  export async function POST(request: Request) {
    const body = await request.json();
    const result = createAccountSchema.safeParse(body);
  
    if (!result.success) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "请求数据不合法",
            issues: formatZodError(result.error)
          }
        },
        { status: 400 }
      );
    }
  
    return Response.json(
      {
        ok: true,
        data: {
          account: result.data
        }
      },
      { status: 201 }
    );
  }