export async function GET() {
    return Response.json({
      ok: true,
      data: {
        service: "ai-finance-cfo",
        status: "healthy",
        timestamp: new Date().toISOString()
      }
    });
  }