"use client";

import { createContext, useContext, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

import { SupabaseClient } from "@supabase/supabase-js";

const Context = createContext<SupabaseClient<Database> | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() =>
    createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );

  return <Context.Provider value={supabase}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return { supabase: context };
};
