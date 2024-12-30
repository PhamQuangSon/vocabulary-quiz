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

export async function POST(req: NextRequest) {
  const { title } = await req.json();

  if (!title) {
    return NextResponse.json(
      { error: "Quiz title is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({ title, status: "waiting" })
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
