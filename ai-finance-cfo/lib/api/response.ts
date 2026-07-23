export function successResponse<T>(data: T, init?: ResponseInit) {
    return Response.json(
      {
        ok: true,
        data
      },
      init
    );
  }
  
  export function errorResponse(
    code: string,
    message: string,
    init?: ResponseInit,
    extra?: Record<string, unknown>
  ) {
    return Response.json(
      {
        ok: false,
        error: {
          code,
          message,
          ...extra
        }
      },
      init
    );
  }
  
  