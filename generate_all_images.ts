import { GoogleGenAI } from "@google/genai";
import { questions } from "./src/questions";
import * as fs from "fs";
import * as path from "path";

// Initialize Gemini client using environment variable
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== STARTING 3D CARTOON IMAGE GENERATION FOR 40 QUESTIONS ===");
  console.log(`Found ${questions.length} questions to process.`);
  
  const imagesDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const filename = `q_${q.id}.png`;
    const filepath = path.join(imagesDir, filename);

    // If file already exists, we skip generation to save quota and make it resumeable
    if (fs.existsSync(filepath)) {
      console.log(`[${i + 1}/40] Skipped: Q${q.id} image already exists at ${filename}`);
      skippedCount++;
      continue;
    }

    const prompt = `A cute, expressive, high-quality 3D cartoon style illustration representing this customer support/service scenario: "${q.scenario}".
Category: ${q.category}.
Visual style: 3D cartoon graphics, cute claymation texture, soft warm studio lighting, playful friendly characters with happy positive expressions, vibrant warm colors, minimalist simple clean background.
CRITICAL: Absolutely NO photos, NO realistic elements, NO complex sketches, NO corporate flat graphics, and absolutely NO text, letters, or words in the image.`;

    console.log(`\n[${i + 1}/40] Generating image for Q${q.id} (Category: ${q.category})`);
    console.log(`Scenario: "${q.scenario.substring(0, 60)}..."`);

    let success = false;
    let retries = 3;

    while (retries > 0 && !success) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
            }
          },
        });

        let base64Data = "";
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              base64Data = part.inlineData.data;
              break;
            }
          }
        }

        if (base64Data) {
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(filepath, buffer);
          console.log(`   Saved image successfully to /public/images/${filename}`);
          successCount++;
          success = true;
        } else {
          console.error(`  ⚠️ No inline image data returned from Gemini for Q${q.id}.`);
          retries--;
          if (retries > 0) {
            console.log(`  Retrying in 3 seconds... (${retries} attempts left)`);
            await sleep(3000);
          }
        }
      } catch (err: any) {
        console.error(`  ❌ Error generating Q${q.id}: ${err.message || err}`);
        retries--;
        if (retries > 0) {
          console.log(`  Retrying in 6 seconds... (${retries} attempts left)`);
          await sleep(6000);
        }
      }
    }

    if (!success) {
      console.error(`  🔴 Failed to generate image for Q${q.id} after all retries.`);
    }

    // Add a polite delay between API requests to respect the rate limits of the user key
    await sleep(2500);
  }

  console.log("\n=== UPDATING QUESTIONS.TS FILE TO USE THE NEW GENERATED IMAGES ===");
  try {
    const questionsFilepath = path.join(process.cwd(), "src", "questions.ts");
    let content = fs.readFileSync(questionsFilepath, "utf8");

    // Replace all imageUrl properties using regex to point to the new q_XX.png files
    content = content.replace(/(id:\s*(\d+),[\s\S]*?imageUrl:\s*')[^\x27]+'/g, (match, p1, id) => {
      return `${p1}/images/q_${id}.png'`;
    });

    fs.writeFileSync(questionsFilepath, content, "utf8");
    console.log(" Successfully updated src/questions.ts with new image paths!");
  } catch (err: any) {
    console.error("❌ Failed to update src/questions.ts:", err.message || err);
  }

  console.log("\n=== IMAGE GENERATION RUN COMPLETED ===");
  console.log(`Generated: ${successCount} images.`);
  console.log(`Skipped: ${skippedCount} images.`);
}

main().catch((err) => {
  console.error("Fatal error in image generator script:", err);
});
