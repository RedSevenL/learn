import dotenv from "dotenv";
import { parseIntentWithDeepSeek } from "../lib/ai/parse-intent-with-deepseek";

// 独立脚本需要手动加载 .env.local
dotenv.config({ path: ".env.local" });

async function main() {
  const question = "我两年内能攒够 50 万吗？";

  const intent = await parseIntentWithDeepSeek(question);

  console.log(
    JSON.stringify(
      {
        question,
        intent,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "未知错误";

  console.error("演示失败：", message);
  process.exitCode = 1;
});