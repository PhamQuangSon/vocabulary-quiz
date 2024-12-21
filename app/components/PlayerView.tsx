"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import { useSupabase } from "@/app/supabase-provider";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/types/supabase";
import { Badge } from "@/app/components/ui/badge";

type Player = Database["public"]["Tables"]["players"]["Row"];
type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"];

interface PlayerViewProps {
  quizId: string;
  playerId: string;
}

export default function PlayerView({ quizId, playerId }: PlayerViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const supabase = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const [quizResponse, playerResponse] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", quizId).single(),
        supabase.from("players").select("*").eq("id", playerId).single(),
      ]);

      if (quizResponse.error)
        console.error("Error fetching quiz:", quizResponse.error);
      else {
        setQuiz(quizResponse.data);
        if (quizResponse.data.status === "active") {
          fetchCurrentQuestion(quizResponse.data.current_question_index);
        }
      }

      if (playerResponse.error)
        console.error("Error fetching player:", playerResponse.error);
      else setPlayer(playerResponse.data);
    };

    const fetchCurrentQuestion = async (index: number) => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("id")
        .range(index, index)
        .single();

      if (error) console.error("Error fetching current question:", error);
      else {
        setCurrentQuestion(data);
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setAnswerResult(null);
      }
    };

    fetchData();

    const quizSubscription = supabase
      .channel("quiz_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quizzes",
          filter: `id=eq.${quizId}`,
        },
        (payload) => {
          setQuiz(payload.new as Quiz);
          if ((payload.new as Quiz).status === "active") {
            fetchCurrentQuestion((payload.new as Quiz).current_question_index);
          }
        }
      )
      .subscribe();

    const playerSubscription = supabase
      .channel("player_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `id=eq.${playerId}`,
        },
        (payload) => {
          setPlayer(payload.new as Player);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quizSubscription);
      supabase.removeChannel(playerSubscription);
    };
  }, [quizId, playerId, supabase]);

  const submitAnswer = async () => {
    if (!currentQuestion || selectedAnswer === null || !player) return;

    const { error } = await supabase.from("answers").insert({
      player_id: playerId,
      question_id: currentQuestion.id,
      answer_text: selectedAnswer,
      response_time: Date.now() - (player.last_answer_time || Date.now()),
      is_correct: selectedAnswer === currentQuestion.correct_answer,
    });

    if (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer.",
        variant: "destructive",
      });
    } else {
      setAnswerSubmitted(true);
      setAnswerResult(
        selectedAnswer === currentQuestion.correct_answer
          ? "correct"
          : "incorrect"
      );
      toast({
        title: "Answer submitted",
        description: "Waiting for the next question.",
      });

      // Update player's last answer time
      await supabase
        .from("players")
        .update({
          last_answer_time: Date.now(),
          score: player.score + (selectedAnswer === currentQuestion.correct_answer ? 1 : 0),
         })
        .eq("id", playerId);
    }
  };

  if (!quiz || !player) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Status: {quiz.status}</p>
          <p>Your Score: {player.score}</p>
        </CardContent>
      </Card>

      {quiz.status === "waiting" && (
        <Card>
          <CardHeader>
            <CardTitle>Waiting for Quiz to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The quiz host will start the quiz soon. Please wait.</p>
          </CardContent>
        </Card>
      )}

      {quiz.status === "active" && currentQuestion && !answerSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{currentQuestion.question_text}</p>
            <div className="grid grid-cols-2 gap-2">
              {Array.isArray(currentQuestion.options) ? (
              currentQuestion.options.map((option, index) => (
                <Button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                variant={selectedAnswer === option ? "default" : "outline"}
                className={`w-full justify-start 
                  ${
                    selectedAnswer === option
                    ? index === 0
                      ? "bg-red-500 dark:bg-red-900"
                      : index === 1
                      ? "bg-blue-500 dark:bg-blue-900"
                      : index === 2
                        ? "bg-orange-500 dark:bg-orange-900"
                        : index === 3
                        ? "bg-green-500 dark:bg-green-900"
                        : "bg-gray-500 dark:bg-gray-800"
                    : index === 0
                      ? "bg-red-100 dark:bg-red-500"
                      : index === 1
                      ? "bg-blue-100 dark:bg-blue-500"
                      : index === 2
                        ? "bg-orange-100 dark:bg-orange-500"
                        : index === 3
                        ? "bg-green-100 dark:bg-green-500"
                        : "bg-gray-100 dark:bg-gray-500"
                  }
                  `}
                >
                <Badge variant="outline" className="mr-2">
                  {String.fromCharCode(65 + index)}
                </Badge>
                {option}
                </Button>
              ))
              ) : (
              <p>No options available for this question.</p>
              )}
            </div>
            <Button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="mt-4 w-full"
              variant={"default"}
            >
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      )}

      {quiz.status === "active" && answerSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your answer has been submitted. Please wait for the next question.
            </p>
            {answerResult && (
              <p
                className={`font-bold ${answerResult === "correct" ? "text-green-600" : "text-red-600"}`}
              >
                Your answer was {answerResult}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {quiz.status === "finished" && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Finished</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The quiz has ended. Your final score is {player.score}.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
