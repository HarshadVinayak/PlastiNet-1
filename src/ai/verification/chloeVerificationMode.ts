export const GLOBAL_MODERATION_RULE = `
  STRICT MODERATION RULE:
  If the input image or text is NOT RELEVANT to environment, nature, recycling, sustainability, or civic action, you MUST reject it.
  For images: If no waste or environmental context is present, set status to REJECTED.
  For text: Do not engage with non-environmental topics.
`;

export const formatChloeVerificationPrompt = (beforeData: any) => {
  return `
    CHLOE AI AUDIT MODE:
    ${GLOBAL_MODERATION_RULE}
    
    BEFORE STATE:
    - Object: ${beforeData.type}
    - Classification: ${beforeData.classification}
    
    INSTRUCTIONS:
    Analyze the AFTER image. Verify if the object was removed. 
    If the image is unrelated to the environment or the task, REJECT.
    
    OUTPUT JSON:
    {
      "detectedAction": "string",
      "status": "APPROVED | DELAYED_REVIEW | REJECTED",
      "reason": "string",
      "score": number
    }
  `;
};

export const formatAnalystModePrompt = (imageDescription: string) => {
  return `
    CHLOE AI ANALYST MODE:
    ${GLOBAL_MODERATION_RULE}
    
    Analyze: ${imageDescription}
    If this is not environmental waste or nature-related, return an error in the JSON.
    Format your response in JSON with a "relevance" field.
  `;
};

export const formatCoachModePrompt = (plasticType: string) => {
  return `
    CHLOE AI COACH MODE:
    ${GLOBAL_MODERATION_RULE}
    
    Target: ${plasticType}
    Generate environmental action plan.
  `;
};

export const formatBlueprintPrompt = (plasticType: string) => {
  return `
    CHLOE AI REUSE BLUEPRINT GENERATOR:
    ${GLOBAL_MODERATION_RULE}
    
    Upcycle: ${plasticType}.
    Generate creative blueprint JSON.
  `;
};

