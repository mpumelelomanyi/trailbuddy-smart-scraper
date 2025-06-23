import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function parseTrailData(raw) {
  const prompt =
    "You are a trail adventure assistant for a hiking app.\n" +
    "Summarize the following raw trail data into 3 clear bullet points and a 1-line user-friendly summary.\n\n" +
    `Title: ${raw.title}\n` +
    `Description: ${raw.description}\n` +
    `Distance: ${raw.distance}\n` +
    `Difficulty: ${raw.difficulty}\n` +
    `Location: ${raw.location}\n` +
    `Details: ${(raw.details || []).join("\\n")}\n\n` +
    "Return a JSON object with:\n" +
    "- title\n" +
    "- summary (1-line description)\n" +
    "- location\n" +
    "- distance_km (extract number only)\n" +
    "- difficulty (one word: Easy, Medium, Hard)\n" +
    "- highlights (3 key bullet points)";

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  return JSON.parse(completion.choices[0].message.content);
}
