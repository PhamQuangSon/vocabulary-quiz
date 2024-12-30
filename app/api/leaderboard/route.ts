import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Anon Key must be provided");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const quizId = searchParams.get("quizId");

  if (!quizId) {
    return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("quiz_participants")
    .select("user_id, score")
    .eq("quiz_id", quizId)
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
