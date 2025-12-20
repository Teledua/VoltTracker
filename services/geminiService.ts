import { GoogleGenAI, Type } from "@google/genai";
import { ElectricBill } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const getAI = () => {
  if (!apiKey) throw new Error("API Key is missing.");
  return new GoogleGenAI({ apiKey });
};

export const analyzeElectricityUsage = async (bills: ElectricBill[]): Promise<string> => {
  const ai = getAI();
  if (bills.length === 0) return "Please add some bill records to generate an AI analysis.";

  const billsJson = JSON.stringify(bills.slice(-12));
  const prompt = `
    I have a dataset of electricity bill purchases. 
    Here is the data (Last 12 records):
    ${billsJson}

    Please analyze this data and provide a concise report in Markdown format.
    1. **Spending Trend**: Are costs going up or down?
    2. **Consumption Efficiency**: Calculate the average days a purchase lasts.
    3. **Anomalies**: Identify any strange records.
    4. **Recommendations**: Give 3 tips to reduce usage.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze data.");
  }
};

export const extractDataFromReceipt = async (base64Image: string): Promise<{ amount?: number; date?: string }> => {
  const ai = getAI();
  
  // Extract just the base64 part
  const data = base64Image.split(',')[1] || base64Image;

  const prompt = "Extract the total amount and the date of purchase from this receipt. Return the date in YYYY-MM-DD format.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data, mimeType: 'image/jpeg' } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The total numeric value of the bill" },
            date: { type: Type.STRING, description: "The date of purchase in YYYY-MM-DD format" }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Receipt Extraction Error:", error);
    return {};
  }
};