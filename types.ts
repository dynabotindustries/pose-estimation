
export interface Keypoint {
  name: string;
  x: number;
  y: number;
  score: number;
}

export type Pose = Keypoint[];

export const BODY_CONNECTIONS: Record<string, string[]> = {
  nose: ["left_eye", "right_eye"],
  left_eye: ["left_ear"],
  right_eye: ["right_ear"],
  left_shoulder: ["right_shoulder", "left_elbow", "left_hip"],
  right_shoulder: ["right_elbow", "right_hip"],
  left_elbow: ["left_wrist"],
  right_elbow: ["right_wrist"],
  left_hip: ["right_hip", "left_knee"],
  right_hip: ["right_knee"],
  left_knee: ["left_ankle"],
  right_knee: ["right_ankle"],
};
