import type { Metadata } from "next";
import SpotGame from "@/components/spot/SpotGame";

export const metadata: Metadata = {
  title: "Temukan yang Beda — Baby Mo Quiz",
  description:
    "Temukan Baby Mo yang berbeda di antara keramaian! Mode kuis seru untuk video YouTube anak — autoplay & interaktif, tampilan iOS yang segar.",
};

export default function SpotPage() {
  return <SpotGame />;
}
