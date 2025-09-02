
import { Pose, Keypoint, BODY_CONNECTIONS } from '../types';

const CONFIDENCE_THRESHOLD = 0.3;
const KEYPOINT_RADIUS = 5;
const LINE_WIDTH = 4;
const KEYPOINT_COLOR = '#06b6d4'; // cyan-500
const LINE_COLOR = '#2dd4bf'; // teal-400

function findKeypoint(pose: Pose, name: string): Keypoint | undefined {
  return pose.find(kp => kp.name === name);
}

export function drawPose(
  ctx: CanvasRenderingContext2D,
  pose: Pose,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Draw connections
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = LINE_WIDTH;

  for (const part in BODY_CONNECTIONS) {
    const startPoint = findKeypoint(pose, part);
    if (!startPoint || startPoint.score < CONFIDENCE_THRESHOLD) continue;

    const connections = BODY_CONNECTIONS[part];
    for (const connection of connections) {
      const endPoint = findKeypoint(pose, connection);
      if (!endPoint || endPoint.score < CONFIDENCE_THRESHOLD) continue;

      ctx.beginPath();
      // Mirror the x-coordinate because the video feed is mirrored
      ctx.moveTo((1 - startPoint.x) * canvasWidth, startPoint.y * canvasHeight);
      ctx.lineTo((1 - endPoint.x) * canvasWidth, endPoint.y * canvasHeight);
      ctx.stroke();
    }
  }

  // Draw keypoints
  ctx.fillStyle = KEYPOINT_COLOR;
  for (const keypoint of pose) {
    if (keypoint.score >= CONFIDENCE_THRESHOLD) {
      ctx.beginPath();
      // Mirror the x-coordinate
      ctx.arc((1 - keypoint.x) * canvasWidth, keypoint.y * canvasHeight, KEYPOINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
