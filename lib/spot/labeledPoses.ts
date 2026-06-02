// Labeled Baby Mo poses used by the "Mana Baby Mo?" match game: fill a grid
// with different poses and ask the player to find the one doing `label`.

export interface LabeledPose {
  file: string;
  /** Fits the prompt "Cari Baby Mo yang ___". */
  label: string;
  funFact: string;
}

export const LABELED_POSES: LabeledPose[] = [
  { file: "baby-mo-run.png", label: "berlari", funFact: "Berlari membuat jantung sehat dan kuat!" },
  { file: "baby-mo-idea.png", label: "punya ide", funFact: "Saat dapat ide, otak menyalakan 'lampu' kecil!" },
  { file: "baby-mo-wow.png", label: "takjub", funFact: "Rasa takjub membuat kita ingin terus belajar." },
  { file: "baby-mo-yes.png", label: "bersemangat", funFact: "Berseru 'Yes!' menambah rasa percaya diri." },
  { file: "baby-mo-yeyy.png", label: "gembira", funFact: "Melompat gembira melepaskan hormon bahagia." },
  { file: "baby-mo-ok.png", label: "bilang oke", funFact: "Tanda 'oke' berarti semuanya baik-baik saja." },
  { file: "baby-mo-thank-you.png", label: "berterima kasih", funFact: "Berterima kasih membuat semua orang bahagia." },
  { file: "baby-mo-alright.png", label: "bergaya keren", funFact: "Salam santai ini disebut 'shaka'." },
  { file: "baby-mo-pose-20.png", label: "berpikir", funFact: "Berpikir dulu melatih kesabaran dan fokus." },
  { file: "baby-mo-pose-31.png", label: "senang", funFact: "Senyum bisa menular ke orang di sekitar kita!" },
  { file: "baby-mo-pose-37.png", label: "sedih", funFact: "Memeluk teman yang sedih sangatlah baik." },
  { file: "baby-mo-pose-09.png", label: "malu", funFact: "Rasa malu itu wajar bagi setiap anak." },
  { file: "baby-mo-pose-06.png", label: "melambai", funFact: "Melambaikan tangan cara ramah menyapa teman." },
  { file: "baby-mo-pose-05.png", label: "mengedip", funFact: "Mengedip sering berarti 'ini rahasia kita ya!'" },
];
