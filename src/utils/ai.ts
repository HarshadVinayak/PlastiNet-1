/**
 * Robustly extracts a JSON object from a string that might contain extra text or markdown formatting.
 */
export const extractJson = (text: string) => {
  try {
    // Try to find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1 || end < start) {
      // If not found, try simple parse as fallback
      return JSON.parse(text.trim());
    }
    
    const jsonStr = text.substring(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to extract JSON from AI response:", text);
    throw new Error("Invalid AI response format.");
  }
};
