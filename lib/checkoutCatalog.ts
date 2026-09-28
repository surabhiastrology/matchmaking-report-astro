export type CheckoutSelection = {
  service: string;
  plan: string;
  amount: number;
  reportType: string;
  isMatchmaking: boolean;
};

type ServiceKey =
  | "consultation"
  | "numerology"
  | "matchmaking"
  | "baby"
  | "specific"
  | "kundli";

type Plan = {
  label: string;
  aliases: string[];
  amount: number;
};

const normalize = (value: string) =>
  value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s*\+\s*/g, "+")
    .replace(/\s+/g, " ");

const withoutDisplayedPrice = (value: string) =>
  value.replace(/\s*\(\s*₹\s*[\d,]+\s*\)\s*/gu, "").trim();

const serviceAliases: Array<{
  key: ServiceKey;
  label: string;
  aliases: string[];
}> = [
  {
    key: "consultation",
    label: "Surbhi Consultation",
    aliases: ["Surbhi Consultation", "Surbhi Gupta Consultation", "सुरभि गुप्ता परामर्श"],
  },
  {
    key: "numerology",
    label: "Numerology Report",
    aliases: ["Numerology Report", "अंकशास्त्र रिपोर्ट"],
  },
  {
    key: "matchmaking",
    label: "Couple Match Making",
    aliases: ["Couple Match Making", "Match Making", "Kundali Milan", "कुंडली मिलान"],
  },
  {
    key: "baby",
    label: "Baby Name Report",
    aliases: ["Baby Name Report", "बच्चों के नाम की रिपोर्ट"],
  },
  {
    key: "specific",
    label: "Career & Business",
    aliases: ["Career & Business", "Career", "करियर और व्यापार"],
  },
  {
    key: "specific",
    label: "Marriage & Relationships",
    aliases: ["Marriage & Relationships", "Love", "विवाह और रिश्ते", "प्रेम"],
  },
  {
    key: "specific",
    label: "Money & Finances",
    aliases: ["Money & Finances", "Money", "धन और वित्त", "धन"],
  },
  {
    key: "specific",
    label: "Health Issues",
    aliases: ["Health Issues", "Health", "स्वास्थ्य समस्याएं", "स्वास्थ्य"],
  },
  {
    key: "specific",
    label: "Family Concerns",
    aliases: ["Family Concerns", "Family", "पारिवारिक चिंताएं", "परिवार"],
  },
  {
    key: "kundli",
    label: "Surbhi Kundali",
    aliases: [
      "Surbhi Kundali",
      "Surbhi Kundli",
      "Premium Personalized Kundali",
      "सुरभि कुंडली",
    ],
  },
];

const plans: Record<ServiceKey, Plan[]> = {
  consultation: [
    { label: "Offline", aliases: ["Offline", "व्यक्तिगत"], amount: 24000 },
    { label: "Priority", aliases: ["Priority", "तत्काल"], amount: 51000 },
  ],
  numerology: [
    { label: "Basic", aliases: ["Basic", "नाम चेक"], amount: 1100 },
    { label: "Correction", aliases: ["Correction", "नाम सुधार"], amount: 5100 },
    { label: "With Call", aliases: ["With Call", "कॉल सहित"], amount: 11000 },
  ],
  matchmaking: [
    { label: "Basic Match", aliases: ["Basic Match", "कपल रिपोर्ट"], amount: 1100 },
    { label: "Match + 1Q", aliases: ["Match + 1Q", "Match+1Q", "रिपोर्ट+Q"], amount: 3300 },
    { label: "Match + Call", aliases: ["Match+Call", "Match + Call", "रिपोर्ट+कॉल"], amount: 11000 },
    { label: "Direct Call", aliases: ["Direct Call", "कपल कॉल"], amount: 15000 },
  ],
  baby: [
    { label: "Baby Report", aliases: ["Baby Report", "बेबी रिपोर्ट"], amount: 1100 },
    { label: "Report + Name", aliases: ["Report+Name", "Report + Name", "रिपोर्ट+नाम"], amount: 5100 },
    { label: "Premium Call", aliases: ["Premium Call", "With Call", "कॉल सहित"], amount: 11000 },
  ],
  specific: [
    {
      label: "10-Year Report + 1Q",
      aliases: ["10-Yr Report+1Q", "10-Year Report+1Q", "10-साल रिपोर्ट+1Q"],
      amount: 999,
    },
    { label: "Report + 1Q", aliases: ["Report + 1Q", "Report+Q", "रिपोर्ट+Q"], amount: 2999 },
    {
      label: "1-on-1 Call",
      aliases: ["1-on-1 Call", "With Call", "व्यक्तिगत कॉल", "कॉल सहित"],
      amount: 11000,
    },
  ],
  kundli: [
    {
      label: "10-Year Report + 1Q",
      aliases: [
        "10-Year Report",
        "10-Yr Report+1Q",
        "10-Year Report+1Q",
        "10-Yr Report + 1Question",
        "10-साल रिपोर्ट+1Q",
      ],
      amount: 999,
    },
    { label: "Report + 1Q", aliases: ["Report + 1Q", "Report+Q", "रिपोर्ट+Q"], amount: 2999 },
    { label: "With Call", aliases: ["With Call", "कॉल सहित"], amount: 11000 },
  ],
};

function findService(value: string) {
  const normalized = normalize(value);
  return serviceAliases.find((service) =>
    service.aliases.some((alias) => normalize(alias) === normalized),
  );
}

function findPlan(serviceKey: ServiceKey, value: string) {
  const normalized = normalize(withoutDisplayedPrice(value));
  return plans[serviceKey].find((plan) =>
    plan.aliases.some((alias) => normalize(alias) === normalized),
  );
}

export function resolveCheckoutSelection(
  serviceValue?: unknown,
  planValue?: unknown,
): CheckoutSelection | null {
  const hasService = typeof serviceValue === "string" && serviceValue.trim() !== "";
  const hasPlan = typeof planValue === "string" && planValue.trim() !== "";

  const requestedService = hasService
    ? (serviceValue as string)
    : "Premium Personalized Kundali";
  const requestedPlan = hasPlan ? (planValue as string) : "10-Year Report";

  const service = findService(requestedService);
  if (!service) return null;

  const plan = findPlan(service.key, requestedPlan);
  if (!plan) return null;

  return {
    service: service.label,
    plan: plan.label,
    amount: plan.amount,
    reportType: `${service.label} - ${plan.label}`,
    isMatchmaking: service.key === "matchmaking",
  };
}
