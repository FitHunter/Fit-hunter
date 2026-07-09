// ============================================================
// FREE LAUNCH MODE — market-validation phase (see Product Brief:
// "everything is free right now, build both sides of the network").
// While true:
//   - trainers appear in search once their setup wizard is complete,
//     no subscription required
//   - the setup wizard skips Stripe checkout entirely
//   - dashboards hide subscribe/billing buttons
// Flip to false (and configure real Stripe keys + price IDs) to
// re-enable the paid-subscription gate.
// ============================================================
export const FREE_LAUNCH = true;

export const CERTIFICATIONS = [
  "ACE", "NASM", "ISSA", "CSCS", "ACSM", "RD", "RDN", "CPT", "CES", "PES",
  "CFSC", "FMS", "CrossFit L1", "CrossFit L2", "Pre/Postnatal Cert",
  "Precision Nutrition (PN1/PN2)", "Other",
] as const;

export const TRAINING_STYLES = [
  "Strength Training", "HIIT / Cardio", "Bodybuilding", "Functional Training",
  "Mobility & Flexibility", "Yoga", "Pilates", "CrossFit-Style", "Online Coaching",
] as const;

export const CLIENT_FOCUS_AREAS = [
  "Weight Loss", "Athletic Performance", "Beginners", "Senior Fitness",
  "Post-Injury / Rehabilitation", "Prenatal/Postnatal", "Bodybuilding Prep",
  "Nutrition Coaching", "Group Fitness",
] as const;

// Kept as a union so existing imports (e.g. the search filter dropdown) keep working
export const SPECIALTIES = [...TRAINING_STYLES, ...CLIENT_FOCUS_AREAS] as const;

export const SESSION_TYPES = [
  "1-on-1", "Small Group", "Online Programming", "Nutrition Coaching",
] as const;

export const TRAINING_LOCATIONS = [
  "My Gym / Studio", "Client's Home", "Specific Gym Locations", "Virtual",
] as const;

export const SESSION_LENGTHS = [30, 45, 60, 90, 120] as const;

export const LANGUAGES = [
  "English", "Spanish", "Mandarin", "French", "Portuguese", "Arabic",
  "Hindi", "Vietnamese", "Korean", "Tagalog",
] as const;

export const PRICING_MODELS = [
  { value: "per_session", label: "Per session" },
  { value: "package", label: "Package" },
  { value: "monthly", label: "Monthly" },
] as const;

export const AVAILABILITY_TYPES = [
  { value: "flexible", label: "Flexible" },
  { value: "limited", label: "Limited" },
] as const;

export const AMENITIES = [
  "Free Weights", "Cardio Machines", "Pool", "Sauna", "Steam Room",
  "Group Fitness Studio", "Basketball Court", "Childcare", "Parking",
  "Locker Rooms", "Towel Service", "Nutrition Bar", "Personal Training Available",
] as const;

export const PROFILE_TYPES = [
  { value: "PERSONAL_TRAINER", label: "Personal Trainer" },
  { value: "GROUP_FITNESS", label: "Group Fitness Instructor" },
  { value: "NUTRITIONIST", label: "Nutritionist/Dietitian" },
  { value: "WELLNESS_COACH", label: "Wellness Coach" },
  { value: "PHYSICAL_THERAPIST", label: "Physical Therapist" },
] as const;

export const TRAINER_REVIEW_CATEGORIES = [
  "Communication", "Expertise", "Motivation", "Punctuality",
] as const;

export const GYM_REVIEW_CATEGORIES = [
  "Cleanliness", "Equipment", "Staff", "Value",
] as const;

export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export const CONTACT_SUBJECTS = [
  "General Inquiry", "Membership Info", "Personal Training", "Classes",
] as const;

export const TRAINER_TIERS = {
  FREE: { name: "Free", price: 0, priceId: null },
  STARTER: { name: "Starter", price: 19, priceId: process.env.STRIPE_TRAINER_STARTER_PRICE_ID },
  PRO: { name: "Pro", price: 39, priceId: process.env.STRIPE_TRAINER_PRO_PRICE_ID },
} as const;

export const GYM_TIERS = {
  UNCLAIMED: { name: "Unclaimed", price: 0, priceId: null },
  BASIC: { name: "Basic", price: 49, priceId: process.env.STRIPE_GYM_BASIC_PRICE_ID },
  VERIFIED: { name: "Verified", price: 99, priceId: process.env.STRIPE_GYM_VERIFIED_PRICE_ID },
} as const;

export const MAX_GYM_PHOTOS = 20;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_TRAINER_SPECIALTIES_PRO = 5;
export const MAX_TRAINER_SPECIALTIES_STARTER = 1;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
export const REVIEW_EDIT_WINDOW_HOURS = 48;
export const REVIEW_RESPONSE_EDIT_WINDOW_HOURS = 48;
export const POSTCARD_EXPIRY_DAYS = 14;
export const FAILED_PAYMENT_GRACE_DAYS = 7;
export const RESULTS_PER_PAGE = 20;
