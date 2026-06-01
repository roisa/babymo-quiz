import type { Metadata } from "next";
import QuizGame from "@/components/game/QuizGame";
import { DEFAULT_CATEGORY } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Main — Baby Mo Quiz",
  description: "Tebak hewan laut dan rekam video kuis YouTube bersama Baby Mo.",
};

export default function PlayPage() {
  // The flagship "Guess The Sea Animal" mode. Future categories get their own
  // routes (or a [category] segment) but reuse this exact <QuizGame />.
  return <QuizGame category={DEFAULT_CATEGORY} />;
}
