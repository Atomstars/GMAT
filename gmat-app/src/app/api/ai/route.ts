import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Build the system instructions and GMAT context
    let contextPrompt = "";
    if (context) {
      contextPrompt = `
[Active GMAT Question Context]
Question Text: ${context.prompt || "N/A"}
User's Selected Answer: ${context.userAnswer || "None selected"}
Is Answer Correct: ${context.isCorrect !== undefined ? (context.isCorrect ? "Yes" : "No") : "N/A"}
`;
    }

    const systemInstruction = `You are a Senior GMAT Focus Edition AI Tutor. You help ambitious MBA candidates master GMAT Quant, Verbal, and Data Insights.
Your goal is to provide elite, structured, step-by-step reasoning.
- Break down the mathematical or logical reasoning clearly in easy-to-read steps.
- Explain WHY the correct option is correct.
- Explain WHY the other options are wrong (trap analysis).
- Provide a GMAT Focus strategic takeaway or shortcut at the end.
- Keep your tone supportive, encouraging, and highly professional.
- Use clean Markdown formatting with bullet points and bold headers for luxury readability.

${contextPrompt}
`;

    // ─── Scenario A: Gemini API Key is available in environment ───
    if (geminiApiKey) {
      try {
        const combinedPrompt = systemInstruction + "\n\nChat History:\n" + 
          messages.map((m: any) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`).join("\n") + 
          "\nTutor: ";

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: combinedPrompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ role: "assistant", content: reply });
          }
        }
      } catch (err) {
        console.error("Gemini API fail, falling back to Pollinations:", err);
      }
    }

    // ─── Scenario B: 100% Free, Keyless Pollinations AI Fallback ───
    // Map standard format to Pollinations messages array
    const pollinationMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: pollinationMessages,
        model: "openai", // Highly capable default reasoning model
      }),
    });

    if (response.ok) {
      const reply = await response.text(); // Pollinations text API returns raw string response
      return NextResponse.json({
        role: "assistant",
        content: reply,
      });
    }

    // Both methods failed
    return NextResponse.json(
      {
        role: "assistant",
        content: "❌ **AI Tutor Offline**\n\nCould not contact the live AI service. Please verify your internet connection and try again.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "❌ **Internal Server Error**\n\nSomething went wrong while processing your request in the Next.js server route.",
      },
      { status: 500 }
    );
  }
}
