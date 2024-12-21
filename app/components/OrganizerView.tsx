"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/app/supabase-provider";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/types/supabase";
import { QuestionForm } from "@/app/components/QuestionForm";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import Leaderboard from "@/app/components/Leaderboard";

type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

interface OrganizerViewProps {
  quizId: string;
}

export default function OrganizerView({ quizId }: OrganizerViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const supabase = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizData = async () => {
      const [quizResponse, questionsResponse, playersResponse] =
        await Promise.all([
          supabase.from("quizzes").select("*").eq("id", quizId).single(),
          supabase
            .from("questions")
            .select("*")
            .eq("quiz_id", quizId)
            .order("id"),
          supabase
            .from("players")
            .select("*")
            .eq("quiz_id", quizId)
            .order("score", { ascending: false }),
        ]);

      if (quizResponse.error)
        console.error("Error fetching quiz:", quizResponse.error);
      else setQuiz(quizResponse.data);

      if (questionsResponse.error)
        console.error("Error fetching questions:", questionsResponse.error);
      else setQuestions(questionsResponse.data);

      if (playersResponse.error)
        console.error("Error fetching players:", playersResponse.error);
      else setPlayers(playersResponse.data);
    };

    fetchQuizData();

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
        fetchQuizData
      )
      .subscribe();

    const playersSubscription = supabase
      .channel("players_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `quiz_id=eq.${quizId}`,
        },
        fetchQuizData
      )
      .subscribe();

    const questionsSubscription = supabase
      .channel("questions_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `quiz_id=eq.${quizId}`,
        },
        fetchQuizData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quizSubscription);
      supabase.removeChannel(playersSubscription);
      supabase.removeChannel(questionsSubscription);
    };
  }, [quizId, supabase]);

  const startQuiz = async () => {
    if (questions.length === 0) {
      toast({
        title: "Cannot start quiz",
        description:
          "Please add at least one question before starting the quiz.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("quizzes")
      .update({ status: "active", current_question_index: 0 })
      .eq("id", quizId);

    if (error) {
      console.error("Error starting quiz:", error);
      toast({
        title: "Error starting quiz",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Quiz started!",
        description: "The first question is now active.",
      });
      setShowQuestionForm(false);
    }
  };

  const nextQuestion = async () => {
    if (!quiz) return;

    const nextIndex = quiz.current_question_index + 1;
    const newStatus = nextIndex >= questions.length ? "finished" : "active";

    const { error } = await supabase
      .from("quizzes")
      .update({ status: newStatus, current_question_index: nextIndex })
      .eq("id", quizId);

    if (error) {
      console.error("Error moving to next question:", error);
      toast({
        title: "Error",
        description: "Failed to move to the next question.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Next question",
        description:
          newStatus === "finished"
            ? "Quiz finished!"
            : "Moving to the next question.",
      });
    }
  };

  if (!quiz) return <div>Loading...</div>;

  const currentQuestion =
    quiz.status === "active" ? questions[quiz.current_question_index] : null;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-100 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>
            Status:{" "}
            <Badge variant={quiz.status === "active" ? "default" : "secondary"}>
              {quiz.status}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Total Questions: {questions.length}</p>
          {quiz.status === "active" && (
            <p>
              Current Question: {quiz.current_question_index + 1} /{" "}
              {questions.length}
            </p>
          )}
          {quiz.status === "waiting" && (
            <div className="space-y-2 mt-4">
              <Button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="bg-blue-500 hover:bg-blue-600 hover:text-white mr-2"
              >
                {showQuestionForm ? "Hide Question Form" : "Add Question"}
              </Button>
              <Button
                onClick={startQuiz}
                disabled={questions.length === 0}
                className="bg-green-500 hover:bg-green-600 hover:text-white mr-2"
              >
                Start Quiz
              </Button>
            </div>
          )}
          {quiz.status === "active" && (
            <Button
              onClick={nextQuestion}
              className="mt-4 bg-gray-600 hover:bg-gray-900 text-white mr-2"
            >
              Next Question
            </Button>
          )}
        </CardContent>
      </Card>

      {showQuestionForm && quiz.status === "waiting" && (
        <Card className="bg-blue-100 dark:bg-blue-800">
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionForm
              quizId={quizId}
              onQuestionAdded={() => setShowQuestionForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {currentQuestion && (
         <Card className="bg-violet-50 dark:bg-violet-400">
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">
              {currentQuestion.question_text}
            </p>
            <ul className="space-y-2">
              {Array.isArray(currentQuestion.options) ? (
                currentQuestion.options.map((option, index) => (
                  <li
                    key={index}
                    className={`flex items-center h-9 px-4 py-2 rounded-md
                   ${
                     currentQuestion.correct_answer === option
                       ? index === 0
                         ? "bg-red-500 dark:bg-red-900 text-white"
                         : index === 1
                           ? "bg-blue-500 dark:bg-blue-900 text-white"
                           : index === 2
                             ? "bg-orange-500 dark:bg-orange-900 text-white"
                             : index === 3
                               ? "bg-green-500 dark:bg-green-900 text-white"
                               : "bg-gray-500 dark:bg-gray-800 text-white"
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
                    <Badge
                      variant={
                        option === currentQuestion.correct_answer
                          ? "default"
                          : "outline"
                      }
                      className="mr-2"
                    >
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    {option}
                  </li>
                ))
              ) : (
                <li>No options available</li>
              )}
            </ul>
            <p className="mt-4">
              Time Limit: {currentQuestion.time_limit} seconds
            </p>
          </CardContent>
        </Card>
      )}

      <Leaderboard quizId={quizId} />

      {quiz.status === "waiting" && (
        <Card>
          <CardHeader>
            <CardTitle>All Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p>
                No questions added yet. Use the 'Add Question' button to create
                questions.
              </p>
            ) : (
              <ul className="space-y-4">
                {questions.map((question, index) => (
                  <li key={question.id}>
                    <p className="font-semibold">
                      Question {index + 1}: {question.question_text}
                    </p>
                    <ul className="ml-4 mt-2 space-y-1">
                      {Array.isArray(question.options) ? (
                        question.options.map((option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={
                              option === question.correct_answer
                                ? "font-bold"
                                : ""
                            }
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </li>
                        ))
                      ) : (
                        <li>No options available</li>
                      )}
                    </ul>
                    <Separator className="my-2" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
