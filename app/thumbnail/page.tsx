import type { Metadata } from "next";
import ThumbnailStudio from "@/components/thumbnail/ThumbnailStudio";
import OceanBackground from "@/components/game/OceanBackground";

export const metadata: Metadata = {
  title: "Thumbnail Studio — Baby Mo Quiz",
  description: "Buat thumbnail YouTube 1280×720 yang menarik klik untuk video kuis Baby Mo.",
};

export default function ThumbnailPage() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <OceanBackground decorations={false} />
      <div className="relative z-10">
        <ThumbnailStudio />
      </div>
    </div>
  );
}
