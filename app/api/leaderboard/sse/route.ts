import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const quizId = searchParams.get("quizId");

  if (!quizId) {
    return new Response("Quiz ID is required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const subscription = supabase
        .channel("leaderboard_updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "quiz_participants",
            filter: `quiz_id=eq.${quizId}`,
          },
          (payload) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
            );
          },
        )
        .subscribe();

      // Keep the connection alive
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 30000);

      // Clean up on close
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        subscription.unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const dynamic = "force-dynamic";