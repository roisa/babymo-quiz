import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizGame from "@/components/game/QuizGame";
import { CATEGORIES, getCategory } from "@/lib/categories";

// Pre-render one static page per available category (static export).
export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.available).map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  return {
    title: cat ? `${cat.title} — Baby Mo Quiz` : "Main — Baby Mo Quiz",
    description: cat?.blurb ?? "Tebak hewan dan rekam video kuis YouTube bersama Baby Mo.",
  };
}

export default async function CategoryPlayPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat || !cat.available) notFound();
  return <QuizGame category={cat} />;
}
