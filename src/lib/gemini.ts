import { GoogleGenAI, HarmCategory, HarmBlockThreshold, type Content, type Part } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface GenerateStoryboardInput {
  shotDescription: string;
  cameraDirection?: string;
  dialogueDirection?: string;
  vfxNotes?: string;
  audioNotes?: string;
  emotionalTone?: string;
  shotType?: string;
  compositionNotes?: string;
  characterDescriptions?: string[];
  environmentDescription?: string;
  continuityNotes?: string;
  style?: string;
  aspectRatio?: string;
  sketchImagePath?: string;
  poseReferenceImagePath?: string;
  poseReferences?: Array<{ characterName: string; imagePath: string }>; // per-character pose refs
  referenceImagePaths?: string[];
  previousShotDescription?: string;
  previousShotImagePath?: string;
}

function buildPrompt(input: GenerateStoryboardInput): string {
  const parts: string[] = [];
  const hasRef = !!input.previousShotImagePath;

  if (hasRef) {
    parts.push(`You are continuing a storyboard sequence. The PREVIOUS FRAME is provided below as your visual reference.`);
    parts.push(``);
    parts.push(`CRITICAL - REPLICATE FROM REFERENCE (highest priority):`);
    parts.push(`- Match the EXACT art style: line weight, shading, color palette, overall aesthetic.`);
    parts.push(`- Match ALL set/props: car interior (ONE steering wheel on driver side only), dashboard, seats, window frame — do NOT add new elements like a second steering wheel.`);
    parts.push(`- Match character designs identically: faces, proportions, outfits, colors.`);
    parts.push(`- The reference defines everything visual. Your output should look like the SAME artist drew the next moment — only pose, camera angle, or action may change.`);
    parts.push(``);
    parts.push(`What changes in THIS frame (only these):`);
  }

  parts.push(`Art style: ${input.style || "cinematic"} storyboard illustration, clean and detailed.`);
  parts.push(`Aspect ratio: ${input.aspectRatio || "16:9"}.`);

  if (input.shotDescription) {
    parts.push(hasRef ? `Action/situation: ${input.shotDescription}` : `\nWhat is depicted in this frame: ${input.shotDescription}`);
  }

  if (input.shotType) {
    parts.push(`Framing: ${input.shotType} shot`);
  }

  if (input.cameraDirection) {
    parts.push(`Camera angle/movement: ${input.cameraDirection}`);
  }

  if (input.emotionalTone) {
    parts.push(`Mood: ${input.emotionalTone}`);
  }

  if (input.characterDescriptions && input.characterDescriptions.length > 0) {
    parts.push(`\nCharacters visible in frame:`);
    input.characterDescriptions.forEach((desc, i) => {
      parts.push(`  ${i + 1}. ${desc}`);
    });
  }

  if (input.environmentDescription) {
    parts.push(hasRef ? `Setting (same as reference): ${input.environmentDescription}` : `\nSetting/location: ${input.environmentDescription}`);
  }

  if (input.compositionNotes) {
    parts.push(`Composition notes: ${input.compositionNotes}`);
  }

  if (input.dialogueDirection) {
    parts.push(`Scene context: ${input.dialogueDirection}`);
  }

  if (input.vfxNotes) {
    parts.push(`Visual elements: ${input.vfxNotes}`);
  }

  if (input.continuityNotes) {
    parts.push(`\nContinuity notes: ${input.continuityNotes}`);
  }

  if (input.previousShotDescription) {
    parts.push(`Previous frame context: ${input.previousShotDescription}`);
  }

  if (input.poseReferences && input.poseReferences.length > 0) {
    input.poseReferences.forEach((pr) => {
      parts.push(`\nPOSE REFERENCE for ${pr.characterName}: An image is provided below. Replicate this EXACT body position and pose for ${pr.characterName} in the scene.`);
    });
  } else if (input.poseReferenceImagePath) {
    parts.push(
      `\nPOSE REFERENCE: An image of the desired pose is provided below. Replicate this EXACT body position, pose, and gesture for the relevant character(s) in the scene. The pose reference takes priority for how the character is positioned.`
    );
  }

  if (hasRef) {
    parts.push(`\nRemember: Preserve the reference's car design (single steering wheel), characters, and style. No new props or layout changes.`);
  }

  parts.push(`\nPlease create one clean storyboard illustration. No text, no borders, no labels — just the artwork.`);

  return parts.join("\n");
}

export async function generateStoryboardImage(
  input: GenerateStoryboardInput
): Promise<{ imagePath: string; prompt: string }> {
  const prompt = buildPrompt(input);

  // Build parts array — put previous frame reference FIRST so model sees it before anything else
  const parts: Part[] = [];

  if (input.previousShotImagePath) {
    const relPath = input.previousShotImagePath.startsWith("/")
      ? input.previousShotImagePath.slice(1)
      : input.previousShotImagePath;
    const fullPath = path.join(process.cwd(), "public", relPath);
    if (fs.existsSync(fullPath)) {
      const imageData = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
      parts.push({
        text: "PRIORITY REFERENCE — This is the previous storyboard frame. Replicate its exact car interior (one steering wheel), character designs, and art style in your output:",
      });
      parts.push({
        inlineData: {
          mimeType,
          data: imageData.toString("base64"),
        },
      });
    }
  }

  parts.push({ text: prompt });

  // Add per-character pose references first
  if (input.poseReferences) {
    for (const pr of input.poseReferences) {
      const relPath = pr.imagePath.startsWith("/") ? pr.imagePath.slice(1) : pr.imagePath;
      const fullPath = path.join(process.cwd(), "public", relPath);
      if (fs.existsSync(fullPath)) {
        const imageData = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
        parts.push({
          text: `POSE REFERENCE for ${pr.characterName} — Replicate this exact body position for ${pr.characterName}:`,
        });
        parts.push({
          inlineData: { mimeType, data: imageData.toString("base64") },
        });
      }
    }
  }
  // Fallback: shot-level pose reference
  else if (input.poseReferenceImagePath) {
    const poseRelPath = input.poseReferenceImagePath.startsWith("/")
      ? input.poseReferenceImagePath.slice(1)
      : input.poseReferenceImagePath;
    const poseFullPath = path.join(process.cwd(), "public", poseRelPath);
    if (fs.existsSync(poseFullPath)) {
      const imageData = fs.readFileSync(poseFullPath);
      const ext = path.extname(poseFullPath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
      parts.push({
        text: "POSE REFERENCE — Replicate this exact body position and gesture for the character(s) in your output:",
      });
      parts.push({
        inlineData: { mimeType, data: imageData.toString("base64") },
      });
    }
  }

  // Add sketch image if provided
  if (input.sketchImagePath) {
    const fullSketchPath = input.sketchImagePath.startsWith("/")
      ? input.sketchImagePath
      : path.join(process.cwd(), "public", input.sketchImagePath);

    if (fs.existsSync(fullSketchPath)) {
      const imageData = fs.readFileSync(fullSketchPath);
      const ext = path.extname(fullSketchPath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
      parts.push({ text: "Use this sketch as a composition reference:" });
      parts.push({
        inlineData: {
          mimeType,
          data: imageData.toString("base64"),
        },
      });
    }
  }

  // Add reference images
  if (input.referenceImagePaths) {
    for (const refPath of input.referenceImagePaths) {
      const fullPath = refPath.startsWith("/")
        ? refPath
        : path.join(process.cwd(), "public", refPath);
      if (fs.existsSync(fullPath)) {
        const imageData = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
        parts.push({ text: "Reference image for visual consistency:" });
        parts.push({
          inlineData: {
            mimeType,
            data: imageData.toString("base64"),
          },
        });
      }
    }
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

  try {
    console.log(`[Gemini] Generating with model: ${model}`);
    console.log(`[Gemini] Prompt length: ${prompt.length} chars`);

    const contents: Content[] = [{ role: "user", parts }];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseModalities: ["IMAGE", "TEXT"],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      },
    });

    console.log(`[Gemini] Response received. Candidates: ${response.candidates?.length ?? 0}`);

    // Log the full response structure for debugging
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log(`[Gemini] Candidate finishReason: ${candidate.finishReason}`);
      console.log(`[Gemini] Candidate parts count: ${candidate.content?.parts?.length ?? 0}`);

      if (candidate.content?.parts) {
        for (let i = 0; i < candidate.content.parts.length; i++) {
          const p = candidate.content.parts[i];
          if (p.text) {
            console.log(`[Gemini] Part ${i}: text (${p.text.length} chars)`);
          } else if (p.inlineData) {
            console.log(`[Gemini] Part ${i}: inlineData (mime: ${p.inlineData.mimeType}, data length: ${p.inlineData.data?.length ?? 0})`);
          } else {
            console.log(`[Gemini] Part ${i}: unknown type - keys: ${Object.keys(p).join(", ")}`);
          }
        }
      }

      // Check for safety/content blocking
      if (candidate.finishReason === "SAFETY" || candidate.finishReason === "PROHIBITED_CONTENT") {
        throw new Error(
          "Generation was blocked by content filters. Try rephrasing your shot description — " +
          "avoid specific references to weapons, violence, drugs, or other sensitive topics. " +
          "Focus on composition, characters, and setting instead."
        );
      }

      // Extract image from parts
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            const ext = mimeType.includes("png") ? "png" : "jpg";
            const filename = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const outputDir = path.join(process.cwd(), "public", "uploads", "generated");

            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }

            const outputPath = path.join(outputDir, filename);
            fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));

            console.log(`[Gemini] Image saved to: ${outputPath}`);

            return {
              imagePath: `/uploads/generated/${filename}`,
              prompt,
            };
          }
        }
      }

      // If we got here, no image was found in the response
      // Check if there's text that might explain why
      const textParts = candidate.content?.parts?.filter(p => p.text) || [];
      if (textParts.length > 0) {
        const textContent = textParts.map(p => p.text).join("\n");
        console.log(`[Gemini] Model returned text instead of image: ${textContent.substring(0, 500)}`);
        throw new Error(`Model returned text instead of image: ${textContent.substring(0, 200)}`);
      }

      throw new Error(`No image found in response. finishReason: ${candidate.finishReason}`);
    }

    // No candidates at all
    console.log(`[Gemini] Full response keys: ${Object.keys(response).join(", ")}`);
    console.log(`[Gemini] Full response: ${JSON.stringify(response).substring(0, 1000)}`);
    throw new Error("No candidates in response from Gemini API");

  } catch (error: unknown) {
    console.error("Gemini generation error:", error);

    // Re-throw with cleaner message
    if (error instanceof Error) {
      if (error.message.includes("Image generation failed") || error.message.includes("Model returned text")) {
        throw error;
      }
      // Check for common API errors
      const msg = error.message;
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        throw new Error("API key doesn't have permission for image generation. Check your Gemini API key settings.");
      }
      if (msg.includes("404")) {
        throw new Error(`Model "${model}" not found. Check GEMINI_MODEL in .env.local`);
      }
      throw new Error(`Image generation failed: ${msg}`);
    }
    throw new Error("Image generation failed: Unknown error");
  }
}
