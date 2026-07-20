import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/utils/rate-limit";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Rate limit: 2 reports per 60 seconds per user (more expensive operation)
    const isAllowed = rateLimit(`ai-report-${user.id}`, 2, 60000);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { vendors } = await req.json();

    if (!Array.isArray(vendors) || vendors.length > 500) {
      return NextResponse.json({ error: "Invalid payload or too many vendors." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
      return NextResponse.json({
        summary: "SYSTEM NOTICE: Groq API Key is missing. This is a mock AI summary.\n\nOverall, the vendor ecosystem displays moderate risk. Pay close attention to vendors missing SOC2 compliance.",
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Build a condensed string of vendor data to feed the AI
    const vendorData = vendors.map((v: any) => 
      `${v.name} (${v.category}): Risk Score ${v.calculated_risk_score}, Promise ${v.sla_uptime_promise}%, Actual ${v.actual_sla ?? v.sla_uptime_promise}%`
    ).join("\n");

    const prompt = `Write a brief, concise executive conclusion analyzing the overall vendor ecosystem risk data:
    
    ${vendorData}
    
    Make it highly actionable and professional. Do NOT use phrases like "As a CISO" or "As an executive". Do not include introductory fluff or repetitive titles.
    Provide a high-level overall analysis of the ecosystem's health based on the Actual vs Promised SLAs and Risk Scores. Keep it brief.
    Context on Risk Score: 1-3 is Low Risk, 4-6 is Medium Risk, 7-10 is High Risk. A 1-2% miss in SLA is a Medium Risk. 
    IMPORTANT: Do NOT hallucinate or assume external factors like "reputation damage", "financial ruin", or "security breaches". Stick strictly to evaluating the uptime numbers and the provided risk scores.
    
    CRITICAL INSTRUCTION: Do NOT use any Markdown formatting, asterisks, bold tags, or bullet points. Return clean plain text paragraphs only.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 300,
    });

    return NextResponse.json({
      summary: chatCompletion.choices[0]?.message?.content || "No summary generated.",
    });
  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary." },
      { status: 500 }
    );
  }
}
