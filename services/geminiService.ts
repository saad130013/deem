import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LessonData, QuizQuestion, LessonRequest } from "../types";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY,
});

const lessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy, fun title for the lesson in Arabic" },
    emoji: { type: Type.STRING, description: "A single emoji representing the topic" },
    introduction: { type: Type.STRING, description: "A warm, engaging introduction suitable for a child in educational Arabic" },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING, description: "Subheading for this section in Arabic" },
          content: { type: Type.STRING, description: "The educational content, written in simple Modern Standard Arabic (Fusha)" },
          visualDescription: { type: Type.STRING, description: "A detailed description for a visual illustration of this section. Style: cheerful, colorful, 3D cartoon." }
        },
        required: ["heading", "content", "visualDescription"]
      }
    },
    funFact: { type: Type.STRING, description: "A surprising or funny fact related to the topic in Arabic" }
  },
  required: ["title", "emoji", "introduction", "sections", "funFact"]
};

const quizSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The question text in simple Arabic" },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 3 or 4 possible answers in Arabic"
      },
      correctAnswerIndex: { type: Type.INTEGER, description: "The index of the correct answer in the options array (0-based)" },
      explanation: { type: Type.STRING, description: "A brief positive explanation in Arabic of why this answer is correct" }
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"]
  }
};

const generateImageForSection = async (description: string): Promise<string | undefined> => {
  const model = "gemini-2.5-flash-image";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Create a cheerful, bright, 3D cartoon style illustration for children. ${description}` }] }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image gen error:", e);
  }
  return undefined;
};

export const generateLesson = async (request: LessonRequest): Promise<LessonData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are an expert elementary school teacher who creates magical, engaging lessons for children.
    Create a lesson for a child aged ${request.ageGroup} years old.
    Topic: ${request.topic}
    Tone: ${request.tone}
    Language: Modern Standard Arabic (Fusha) suitable for primary education.
    
    Instructions:
    1. Use simple, clear, and educational Arabic vocabulary (لغة عربية فصحى مبسطة).
    2. Make it visually descriptive and break it down into small digestible parts.
    3. Ensure the content is accurate and educational.
    4. Avoid complex sentence structures.
    
    The content MUST be in Arabic.
  `;

  const parts: any[] = [{ text: prompt }];

  if (request.image) {
    const base64Data = request.image.split(',')[1] || request.image;
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
    parts.push({ text: "Please incorporate the content of the attached image into the lesson explanation if relevant." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: lessonSchema,
      systemInstruction: `You are '${request.teacherName || 'Teacher'}'. Write in clear, educational, Modern Standard Arabic (اللغة العربية الفصحى التعليمية) suitable for children.`
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  const lessonData = JSON.parse(response.text) as LessonData;
  
  // Inject teacher and class info provided by user
  lessonData.teacherName = request.teacherName;
  lessonData.className = request.className;

  // Generate images for sections
  try {
    const sectionsWithImages = await Promise.all(lessonData.sections.map(async (section) => {
        if (section.visualDescription) {
            const imageUrl = await generateImageForSection(section.visualDescription);
            return { ...section, imageUrl };
        }
        return section;
    }));
    return { ...lessonData, sections: sectionsWithImages };
  } catch (e) {
      console.error("Error generating section images", e);
      return lessonData; 
  }
};

export const generateQuiz = async (lessonContext: LessonData): Promise<QuizQuestion[]> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Based on the following lesson, create 3 fun multiple-choice questions to check understanding.
    Language: Modern Standard Arabic (Fusha).
    
    Lesson Title: ${lessonContext.title}
    Lesson Content Summary: ${lessonContext.introduction} ${lessonContext.sections.map(s => s.content).join(' ')}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
      systemInstruction: "Create supportive, non-tricky questions suitable for children. Use clear educational Arabic."
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as QuizQuestion[];
};
