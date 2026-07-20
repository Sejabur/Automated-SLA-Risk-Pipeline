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

    // Rate limit: 5 requests per 60 seconds per user
    const isAllowed = rateLimit(`ai-brief-${user.id}`, 5, 60000);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { vendorName, category, riskScore, certs, promisedSla, actualSla } = body;

    // Basic Input Validation
    if (!vendorName || typeof vendorName !== 'string' || vendorName.length > 100) {
      return NextResponse.json({ error: "Invalid vendor name payload" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
      return NextResponse.json({
        brief: "SYSTEM NOTICE: Groq API Key is missing. This is a mock AI brief.\n\nBased on the profile of this vendor, ensure that you review their latest SOC2 type II audit report and verify their data residency policies.",
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Write a brief, punchy executive summary on the profile of this vendor:
    Name: ${vendorName}
    Category: ${category}
    Risk Score (1-10, 10 being worst): ${riskScore}
    Promised SLA: ${promisedSla}%
    Actual SLA: ${actualSla}%
    Certifications: ${certs?.join(", ") || "None"}
    
    Make it highly actionable and professional. Analyze the difference between their Promised SLA and Actual SLA, as well as their Risk Score. 
    Context on Risk Score: 1-3 is Low Risk, 4-6 is Medium Risk, 7-10 is High Risk. A 1% miss in SLA is a Medium Risk (around 6). 
    IMPORTANT: If they are meeting or exceeding their promised SLA, explicitly acknowledge their strong performance and reliability. If they miss their SLA by a small decimal (e.g. 1%), state that it's a moderate risk purely based on uptime metrics. DO NOT hallucinate or assume external factors like "reputation damage", "financial ruin", or "security breach" unless specifically indicated by their score or missing certs. Only provide corrective mitigations directly related to uptime or certifications.
    
    CRITICAL INSTRUCTION: Do NOT use any Markdown formatting, asterisks, bold tags, or bullet points. Do not include a title. Return only a single, well-written plain text paragraph. Do not say "As an executive" or "As a CISO".`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 150,
    });

    return NextResponse.json({
      brief: chatCompletion.choices[0]?.message?.content || "No brief generated.",
    });
  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI brief." },
      { status: 500 }
    );
  }
}
