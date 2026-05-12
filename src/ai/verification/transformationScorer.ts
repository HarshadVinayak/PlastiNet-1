export const calculateTransformationScore = (
  complexity: number,
  action: string,
  consistency: number
): number => {
  // Logic to calculate 0-100 score
  const base = complexity * 0.4;
  const actionBonus = action === "Recycle" ? 40 : 20;
  const multiplier = consistency / 100;
  
  return Math.min(100, Math.round((base + actionBonus) * multiplier + 20));
};
