
import { GoogleGenAI, Type } from "@google/genai";
import { Pose } from '../types';

// Lazily initialize to avoid a hard crash if the API key is missing on load.
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please configure it in your project's deployment settings.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}


const poseDetectionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      x: { type: Type.NUMBER },
      y: { type: Type.NUMBER },
      score: { type: Type.NUMBER },
    },
    required: ["name", "x", "y", "score"],
  },
};

const systemInstruction = `You are an expert pose estimation model. Analyze the provided image and identify the locations of 17 key human body points. Return the data as a JSON object that adheres to the provided schema. The keypoints are: nose, left_eye, right_eye, left_ear, right_ear, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle. The x and y coordinates should be normalized between 0.0 and 1.0, where (0,0) is the top-left corner of the image. Provide a confidence score between 0.0 and 1.0 for each point. If a point is not visible, its score should be low.`;

export async function estimatePose(imageBase64: string): Promise<Pose | null> {
    const dataUrlParts = imageBase64.split(',');
    if (dataUrlParts.length !== 2) {
        throw new Error("Invalid base64 image format");
    }
    const base64Data = dataUrlParts[1];

    try {
        const geminiClient = getAiInstance();
        const response = await geminiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data,
                        },
                    },
                ],
            },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: poseDetectionSchema,
            },
        });

        const jsonText = response.text.trim();
        const poseData = JSON.parse(jsonText) as Pose;
        return poseData;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Propagate the specific error message, whether it's from the key check or the API call itself.
        const message = error instanceof Error ? error.message : "Failed to estimate pose from the Gemini API.";
        throw new Error(message);
    }
}
