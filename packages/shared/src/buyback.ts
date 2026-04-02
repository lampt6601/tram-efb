const TIERS = [
  { maxDays: 0, rate: 0.8, label: "Ngày đầu" },
  { maxDays: 10, rate: 0.7, label: "Từ 1–10 ngày" },
  { maxDays: 20, rate: 0.65, label: "Từ 11–20 ngày" },
  { maxDays: Infinity, rate: 0.6, label: "Từ 21 ngày trở đi" },
];

export function getBuybackInfo(soldAt: string) {
  const days = Math.floor(
    (Date.now() - new Date(soldAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  let tier = TIERS[TIERS.length - 1];
  if (days <= 0) tier = TIERS[0];
  else if (days <= 10) tier = TIERS[1];
  else if (days <= 20) tier = TIERS[2];

  return { rate: tier.rate, days, label: tier.label, percent: Math.round(tier.rate * 100) };
}

export function calculateBuybackPrice(sellingPrice: number, soldAt: string) {
  const { rate } = getBuybackInfo(soldAt);
  return Math.round(sellingPrice * rate);
}
