"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/supabase-provider";

interface LeaderboardEntry {
  user_id: string;
  score: number;
}

export default function Leaderboard({ quizId }: { quizId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await fetch(`/api/leaderboard?quizId=${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        console.error("Failed to fetch leaderboard");
      }
    };

    fetchLeaderboard();

    const eventSource = new EventSource(
      `/api/leaderboard/sse?quizId=${quizId}`,
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLeaderboard((prevLeaderboard) => {
        const updatedLeaderboard = prevLeaderboard.map((entry) =>
          entry.user_id === data.new.user_id
            ? { ...entry, score: data.new.score }
            : entry,
        );
        return updatedLeaderboard.sort((a, b) => b.score - a.score);
      });
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [quizId, supabase]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {leaderboard.map((entry, index) => (
          <li key={entry.user_id} className="flex justify-between items-center">
            <span className="font-semibold">
              {index + 1}. User {entry.user_id}
            </span>
            <span className="text-gray-600">{entry.score} points</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
