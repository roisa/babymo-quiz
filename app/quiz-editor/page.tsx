import type { Metadata } from "next";
import QuizEditor from "@/components/editor/QuizEditor";
import OceanBackground from "@/components/game/OceanBackground";

export const metadata: Metadata = {
  title: "Editor Kuis — Baby Mo Quiz",
  description: "Tambah, ubah, dan kelola data hewan untuk kuis Baby Mo. Export & import JSON.",
};

export default function QuizEditorPage() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <OceanBackground decorations={false} />
      <div className="relative z-10">
        <QuizEditor />
      </div>
    </div>
  );
}
