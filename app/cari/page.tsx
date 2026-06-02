import type { Metadata } from "next";
import SpotGame from "@/components/spot/SpotGame";

export const metadata: Metadata = {
  title: "Mana Baby Mo? — Baby Mo Quiz",
  description:
    "Temukan Baby Mo yang sedang melakukan gaya tertentu di antara keramaian! Mode kuis seru untuk video YouTube anak — autoplay & interaktif.",
};

export default function CariPage() {
  return <SpotGame variant="match" />;
}
