
import { GoogleGenAI, Type } from "@google/genai";
import { CitizenProfile, Scheme, DocumentScanResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getAIInstance = () => new GoogleGenAI({ apiKey: API_KEY });

export async function discoverSchemes(profile: CitizenProfile): Promise<string> {
  const ai = getAIInstance();
  const prompt = `Find current Indian government schemes for a citizen with the following profile:
    Age: ${profile.age}, Gender: ${profile.gender}, State: ${profile.state}, Income: ${profile.incomeRange}, Occupation: ${profile.occupation}, Category: ${profile.category || 'General'}.
    Include both Central and ${profile.state} State specific schemes.
    Focus on high-impact schemes with tangible benefits.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "";
}

export async function analyzeSchemesDeeply(schemesRaw: string, profile: CitizenProfile): Promise<Scheme[]> {
  const ai = getAIInstance();
  const prompt = `
    ACT AS CIVIX.AI - AUTONOMOUS ACTION AGENT.
    Analyze the following schemes for this citizen: ${JSON.stringify(profile)}.
    Schemes Context: ${schemesRaw}
    
    CRITICAL INSTRUCTIONS:
    1. Verify eligibility using deep reasoning. Self-correct for income limits vs household size.
    2. Create a concrete 7-day action plan (Day 1, 3, 7).
    3. Identify specific document risks and rule ambiguities.
    4. Set a next autonomous check trigger.

    Output ONLY a valid JSON array of objects matching this schema:
    [{
      "id": string,
      "name": string,
      "provider": string,
      "eligibility": "YES" | "NO" | "PROBABLE",
      "benefit": string,
      "deadline": string,
      "urgency": "HIGH" | "MEDIUM" | "LOW",
      "confidence": number,
      "description": string,
      "requiredDocuments": [{"name": string, "status": "MISSING"}],
      "actionPlan": [{"day": number, "task": string, "status": "PENDING", "details": string}],
      "risks": {"ambiguity": string, "documentRisk": string},
      "nextCheck": {"trigger": string, "date": string}
    }]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json"
    }
  });

  try {
    const text = response.text || "[]";
    // Basic cleanup in case of markdown wrapping
    const jsonStr = text.includes('```') ? text.split('```')[1].replace('json', '').trim() : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return [];
  }
}

export async function extractDocumentInfo(base64Image: string): Promise<DocumentScanResult> {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } },
        { text: "Extract Name, Date of Birth, and ID number from this document. Identify the document type (Aadhaar, PAN, Voter ID, etc.). Return as JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });
  
  try {
    const text = response.text || "{}";
    const jsonStr = text.includes('```') ? text.split('```')[1].replace('json', '').trim() : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    return {};
  }
}
