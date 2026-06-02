// Cheerful Baby Mo poses used to bring quiz answers to life. A different pose
// sits beside each answer choice, varied per question but stable within it.

export const ANSWER_POSES = [
  "baby-mo-yes.png",
  "baby-mo-yeyy.png",
  "baby-mo-wow.png",
  "baby-mo-idea.png",
  "baby-mo-ok.png",
  "baby-mo-alright.png",
  "baby-mo-thank-you.png",
  "baby-mo-pose-31.png",
  "baby-mo-pose-05.png",
  "baby-mo-run.png",
] as const;

/** A happy "correct answer" celebration pose. */
export const WIN_POSE = "baby-mo-yeyy.png";

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic, varied pose path for answer `index` of a given question. */
export function poseForAnswer(seed: string, index: number): string {
  const pose = ANSWER_POSES[(hash(seed) + index) % ANSWER_POSES.length];
  return `/baby-mo-poses/${pose}`;
}

export const winPoseSrc = `/baby-mo-poses/${WIN_POSE}`;
