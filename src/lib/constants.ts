export const CERTIFICATIONS = [
  "ACE", "NASM", "ISSA", "CSCS", "ACSM", "RD", "RDN", "CPT", "CES", "PES",
  "CFSC", "FMS", "CrossFit L1", "CrossFit L2", "Other",
] as const;

export const SPECIALTIES = [
  "Weight Loss", "Strength Training", "Sports Performance", "Prenatal/Postnatal",
  "Senior Fitness", "Bodybuilding", "Mobility & Flexibility", "Nutrition Coaching",
  "Group Fitness", "Yoga", "Pilates", "Rehabilitation", "Online Coaching",
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
export const REVIEW_EDIT_WINDOW_HOURS = 48;
export const REVIEW_RESPONSE_EDIT_WINDOW_HOURS = 48;
export const POSTCARD_EXPIRY_DAYS = 14;
export const FAILED_PAYMENT_GRACE_DAYS = 7;
export const RESULTS_PER_PAGE = 20;
