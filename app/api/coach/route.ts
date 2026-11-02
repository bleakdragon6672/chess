import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question, context } = await request.json().catch(() => ({}));
  const apiKey = process.env.INCEPTION_API_KEY;
  if (!apiKey) return NextResponse.json({ answer: "Coach mode is ready locally. Focus on checks, captures, threats, and your least active piece, then ask me a more specific question about the position." });
  try {
    const response = await fetch("https://api.inceptionlabs.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.INCEPTION_MODEL ?? "mercury-3", messages: [{ role: "system", content: "You are a concise, encouraging chess Grandmaster coach. Explain ideas in plain language and use algebraic notation when useful." }, { role: "user", content: `Position context: ${context}\nQuestion: ${question}` }], reasoning_effort: "instant", temperature: .7, max_completion_tokens: 1024 }),
    });
    if (!response.ok) throw new Error("Coach request failed");
    const data = await response.json();
    return NextResponse.json({ answer: data.choices?.[0]?.message?.content ?? "I could not find a clear explanation for that position." });
  } catch { return NextResponse.json({ answer: "The coach is temporarily offline, but the key checklist remains: checks, captures, threats, then the opponent's best reply." }); }
}
