"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/app/supabase-provider";

export default function JoinQuiz() {
  const [quizId, setQuizId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if quiz exists and is waiting for players
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select()
        .eq("id", quizId)
        .single();

      if (quizError) {
        console.error("Error fetching quiz:", quizError);
        throw new Error("Quiz not found");
      }

      if (quiz.status !== "waiting") {
        throw new Error("Quiz has already started");
      }

      // Join the quiz
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          name,
          quiz_id: quizId,
          score: 0,
        })
        .select()
        .single();

      if (playerError) {
        console.error("Error joining quiz:", playerError);
        throw playerError;
      }

      if (!player) {
        throw new Error("Failed to create player");
      }

      toast({
        title: "Joined quiz successfully!",
        description: "You will be redirected to the quiz page.",
      });

      router.push(`/quiz/${quizId}/player/${player.id}`);
    } catch (error) {
      console.error("Error joining quiz:", error);
      toast({
        title: "Error joining quiz",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Join a Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizId">Quiz ID</Label>
                <Input
                  id="quizId"
                  value={quizId}
                  onChange={(e) => setQuizId(e.target.value)}
                  placeholder="Enter quiz ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Joining..." : "Join Quiz"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
