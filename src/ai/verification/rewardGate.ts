export type RewardResult = {
  finalPLC: number;
  status: 'APPROVED' | 'DELAYED_REVIEW' | 'REJECTED';
  isGated: boolean;
  message: string;
};

export const processRewardGate = (
  baseReward: number,
  transformationScore: number,
  trustScore: number
): RewardResult => {
  if (trustScore < 50) {
    return {
      finalPLC: 0,
      status: 'REJECTED',
      isGated: true,
      message: "Suspicious activity detected. Verification rejected."
    };
  }

  if (trustScore >= 50 && trustScore < 80) {
    const finalPLC = Math.round(baseReward * (transformationScore / 50));
    return {
      finalPLC,
      status: 'DELAYED_REVIEW',
      isGated: true,
      message: "Verification pending. Reward held for manual review."
    };
  }

  // trustScore >= 80
  const multiplier = transformationScore / 50; // Normalize 50 as x1.0
  const finalPLC = Math.round(baseReward * multiplier);

  return {
    finalPLC,
    status: 'APPROVED',
    isGated: false,
    message: finalPLC > 0 ? `Successfully verified! ${finalPLC} PLC awarded.` : "Action verified, but minimal impact detected."
  };
};
