import { GoogleGenAI } from "@google/genai";
import { ElectricBill } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid runtime crashes on init
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeElectricityUsage = async (bills: ElectricBill[]): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  if (bills.length === 0) {
    return "Please add some bill records to generate an AI analysis.";
  }

  // Format data for the prompt
  const billsJson = JSON.stringify(bills.slice(-12)); // Analyze last 12 entries to save context

  const prompt = `
    I have a dataset of electricity bill purchases. 
    Here is the data (Last 12 records):
    ${billsJson}

    Please analyze this data and provide a concise report in Markdown format.
    
    1. **Spending Trend**: Are costs going up or down?
    2. **Consumption Efficiency**: Calculate the average days a purchase lasts (Date Finished - Date Inserted).
    3. **Anomalies**: Identify any purchase that didn't last as long as usual or cost significantly more.
    4. **Recommendations**: Give 3 quick tips to reduce electricity consumption based on general best practices.

    Keep the tone professional yet helpful. Use bullet points and bold text for emphasis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis could be generated at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze data with Gemini.");
  }
};