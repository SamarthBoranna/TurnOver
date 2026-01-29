import { GoogleGenAI } from "@google/genai";
import { Shoe, UserProfile, UserShoe, ShoeCategory } from "../types";

// Initialize the client. 
const apiKey = process.env.API_KEY || 'dummy_key';
const ai = new GoogleGenAI({ apiKey });

export const getShoeRecommendationReason = async (
  targetShoe: Shoe,
  userProfile: UserProfile,
  currentRotation: UserShoe[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Matches your mileage profile and rotation gaps.";
  }

  const ownedList = currentRotation.map(s => `${s.brand} ${s.model} (${s.category})`).join(', ');

  const prompt = `
    Act as an expert running shoe coach.
    User Profile: Runs ${userProfile.weeklyMileage}km/week, prefers ${userProfile.preference} feel.
    Current Rotation: ${ownedList}.
    Target Shoe: ${targetShoe.brand} ${targetShoe.model} (${targetShoe.category}).
    
    Explain in 10-15 words why this Target Shoe works for this specific runner. 
    Focus on technical fit (stack, drop) or rotation gap. No marketing fluff.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "A solid addition for your weekly mileage.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A versatile option for your training volume.";
  }
};

export const getRotationAnalysis = async (rotation: UserShoe[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Rotation looks balanced. Consider checking wear on older models.";
  }

  const rotationData = rotation.map(s => `${s.brand} ${s.model} (${s.currentMileage}/${s.maxMileage}km) - Status: ${s.status}`).join('\n');
  
  const prompt = `
    Analyze this running shoe rotation:
    ${rotationData}
    
    Provide a 1-sentence actionable insight. If a shoe is 'warning' status, suggest replacing it. If they lack a category, suggest adding it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Monitor your mileage closely to prevent injury.";
  } catch (error) {
     console.error("Gemini API Error:", error);
    return "Keep tracking mileage to stay healthy.";
  }
};

export const getPreferenceInsights = async (userProfile: UserProfile, history: UserShoe[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return `Based on your history, you prefer ${userProfile.preference} shoes for daily miles.`;
    }

    const historyText = history.map(s => 
        `Shoe: ${s.brand} ${s.model} (${s.category}). Mileage: ${s.currentMileage}. Active: ${s.isActive}. Notes: ${s.notes || 'None'}`
    ).join('\n');

    const prompt = `
        Analyze this runner's shoe history and profile:
        Weekly Mileage: ${userProfile.weeklyMileage}km
        Preference: ${userProfile.preference}
        History:
        ${historyText}

        Generate a JSON object (do not wrap in markdown code blocks) describing their ideal features for 3 categories: "Daily", "Race", "Recovery".
        Format:
        {
            "Daily": "Short description of ideal features (e.g. 8-10mm drop, medium cushion)",
            "Race": "Short description",
            "Recovery": "Short description"
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return response.text?.trim() || "{}";
    } catch (error) {
        return JSON.stringify({
            "Daily": "Reliable workhorses with moderate cushioning.",
            "Race": "Lightweight plated shoes.",
            "Recovery": "Max cushion for easy days."
        });
    }
}