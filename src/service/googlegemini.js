import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY'); 

const generateFallbackPitch = (ideaData) => {
  const { description, industry, tone } = ideaData;
  const startupName = description.split(" ").slice(0, 2).join("");
  const taglines = {
    professional: "Innovation Meets Excellence",
    casual: "Making Life Better",
    innovative: "Tomorrow's Solutions Today",
  };

  return {
    startupName,
    tagline: taglines[tone] || taglines.professional,
    elevatorPitch: `${startupName} is transforming the ${industry} industry by ${description}.`,
  };
};

// ✅ Main AI function
export const generatePitch = async (idea, industry, tone) => {
  const ideaData = { description: idea, industry, tone };
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Generate a JSON startup pitch for:
      Idea: ${idea}
      Industry: ${industry}
      Tone: ${tone}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    else throw new Error("Invalid AI response format");
  } catch (error) {
    console.warn("⚠️ Using fallback generator due to error:", error.message);
    return generateFallbackPitch(ideaData);
  }
};
