# NextFit — Claude Code Build Prompt
# Copy everything below this line and paste into Claude Code

---

Build a web application called **NextFit** — a fitness discovery and review platform, the "Angie's List for the fitness world." All product context is included below. Read everything carefully before writing any code.

**Tech stack:**
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS for styling
- PostgreSQL with Prisma ORM
- NextAuth.js for authentication (email/password + Google OAuth)
- Stripe for subscription billing
- Cloudinary for image uploads
- Resend for transactional email
- Deploy target: Vercel

**Build order:**
1. Project setup + dependencies
2. Prisma database schema (all models)
3. Authentication (registration with account type, login, email verification, password reset)
4. Then work through the MVP Scope checklist feature by feature

**Key rules:**
- Consumers can browse and search without logging in — login only required to contact or review
- Mobile-first, fully responsive throughout
- SEO meta tags + Schema.org structured data on all public profile pages
- Stripe Checkout for subscriptions, Stripe Customer Portal for billing management
- All reviews go into a moderation queue before publishing
- Ask before building anything not covered in the spec below

---

# PRODUCT DOCUMENTATION

---

## SECTION 1: WHAT IS FITWELL

NextFit is a multi-sided marketplace connecting three audiences:
- **Consumers** — people searching for gyms and fitness professionals
- **Fitness Professionals** — personal trainers, coaches, nutritionists
- **Gyms & Studios** — facilities looking to attract members and trainers

The core loop: someone searches → finds a trainer or gym → contacts them → leaves a review.

**The problem it solves:** No single platform connects gym discovery, trainer profiles with certifications, verified reviews, and booking. Google/Yelp, ACE/NASM directories, FindYourTrainer, Mindbody, and ClassPass all solve pieces but not the whole.

---

## SECTION 2: BUSINESS MODEL & MONETIZATION

### Trainer & Coach Subscriptions (Primary Revenue)

| Tier | Price | What's Included |
|---|---|---|
| Free | $0/mo | Basic profile, name + certifications only, not searchable, no reviews shown |
| Starter | $19/mo | Fully searchable, reviews visible, 1 specialty listed, contact form |
| Pro | $39/mo | Everything in Starter + VSL video, booking link, priority placement, up to 5 specialties |

### Gym & Studio Subscriptions (Primary Revenue)

| Tier | Price | What's Included |
|---|---|---|
| Unclaimed | $0 | Auto-generated stub listing, not editable |
| Basic Claim | $49/mo | Full profile edit, photos, hours, amenities, contact info |
| Verified | $99/mo | Everything in Basic + verified badge, class listings, "Who Works Here" trainer links, review response ability, analytics |

### Pricing rules:
- Consumers are always free — no paywall on the demand side
- Downgrade takes effect at end of billing period
- Upgrade takes effect immediately (prorated)
- Failed payments: 7-day grace period before downgrade to free tier

---

## SECTION 3: USER PERSONAS

### Persona 1: The Fitness Seeker (Consumer)
Jordan, 31, recently relocated, no local network. Wants to find a certified personal trainer specializing in weight loss and a gym near her apartment. Frustrated that Google shows gyms but not the trainers inside them, and that Yelp reviews don't cover training quality. Needs verified reviews and easy filtering. Must be able to contact trainers without giving out personal info upfront.

### Persona 2: The Independent Trainer
Marcus, 27, NASM-CPT, works out of two gyms. Gets clients through Instagram and word of mouth. Needs a profile that showcases his certifications, collects client reviews, and gets him discovered — without paying per lead or running constant content. His ROI metric is: does NextFit bring him contact requests?

### Persona 3: The Gym Owner
Diane, 44, owns an independent gym with ~300 members. Wants to attract new members, showcase her trainers, and find quality independent trainers to fill open floor space. Frustrated that Yelp reviews give no ability to tell her full story. Needs to respond to reviews and monitor her online reputation.

### Persona 4: The Relocating Trainer (key unique use case)
Devon, 33, ISSA-CPT, moving to a new city. Needs to evaluate gyms as business partners before arriving — comparing comp rates (split vs. hourly), member traffic, equipment quality, and trainer-friendliness. This is the Trainer-to-Gym matching feature (deferred to v2, but inform DB schema design).

### Persona 5: The Nutrition Coach
Priya, 38, Registered Dietitian (RD), virtual practice. Invisible on every fitness platform. Needs a profile that distinguishes her RD credential from uncertified "nutrition coaches" and lets her be discovered by trainers who can refer clients to her.

---

## SECTION 4: MVP SCOPE (V1 — BUILD ONLY THIS)

### Authentication & Accounts
- Consumer account creation (email + password, Google OAuth)
- Trainer/Coach account creation with profile type selection
- Gym account creation
- Email verification required before account is active
- Password reset flow
- Basic profile settings (name, email, password, profile photo)

### Trainer Profiles
- Profile creation wizard: name, bio, photo, certifications, specialties, location
- Certification input (manual entry in v1 — verification badge via admin review)
- Specialty tags (predefined list — see Feature Spec below)
- In-person location field (link to gym or enter address)
- "Virtual sessions available" toggle
- VSL video embed (YouTube/Vimeo URL only — no self-hosting)
- External booking link field (Calendly, Acuity, etc.)
- "Request a Free Consult" contact form (sends email to trainer)
- Public profile page with shareable URL: /trainer/[slug]

### Gym Profiles
- Gym listing creation (name, address, phone, website, hours)
- Photo upload (up to 20 photos, JPEG/PNG, max 5MB each)
- Amenities checklist
- Pricing info field (free text)
- Classes offered (free text list)
- "Who Works Here" section — trainer profiles self-link to gym
- Claim flow — verify via email domain match or postcard (6-digit code)
- Verified badge displayed after successful claim + Verified subscription

### Reviews
- Star rating + written review for trainers (1–5 stars overall + category ratings)
- Star rating + written review for gyms (1–5 stars overall + category ratings)
- Trainer category ratings: Communication, Expertise, Motivation, Punctuality
- Gym category ratings: Cleanliness, Equipment, Staff, Value
- Review requires logged-in account + confirmation checkbox
- All reviews go to moderation queue before publishing
- "Flag review" button
- Average rating displayed on profiles

### Search & Discovery
- Search bar on homepage (text + city/zip)
- "Near me" geolocation search
- Filter by type: Gym, Personal Trainer, Group Fitness Instructor, Nutritionist/Dietitian, Wellness Coach, Physical Therapist
- Filter by specialty
- Filter by minimum rating (3+, 4+, 4.5+)
- Filter by availability (In-Person, Virtual, Both)
- Filter: Verified only toggle
- Results page: card layout (photo, name, type badge, rating, location, top specialty)
- Sort by: Top Rated, Most Reviewed, Nearest
- Dynamic filter updates (no page reload)
- Zero results state with helpful message
- Auto-generated SEO pages for city + type + specialty combinations

### Contact & Messaging
- "Request a Free Consult" form on trainer profiles → email notification to trainer
- "Contact Gym" form on gym profiles → email notification to gym
- Contact request logged in trainer dashboard
- Sender receives confirmation email

### Trainer Dashboard
- Edit profile
- View incoming contact requests (name, date, message preview)
- View reviews (published + pending)
- Profile view count (7-day, 30-day)
- Copy shareable profile link
- Manage subscription / billing (Stripe Customer Portal)

### Gym Dashboard
- Edit gym profile
- View and respond to reviews
- Profile view count (7-day, 30-day)
- View linked trainer profiles
- Manage subscription / billing (Stripe Customer Portal)

### Subscriptions & Payments
- Stripe integration — Stripe Checkout for signup, Stripe Customer Portal for management
- Stripe webhooks: handle subscription.active, subscription.canceled, subscription.past_due
- Trainer tiers: Free, Starter ($19/mo), Pro ($39/mo)
- Gym tiers: Unclaimed (free stub), Basic ($49/mo), Verified ($99/mo)
- Upgrade/downgrade flow
- Billing history page
- Cancel subscription flow

### Admin Panel (/admin — protected route)
- View and manage all user accounts (filter by type, status, join date)
- Review moderation queue: Approve / Reject (with reason) / Flag
- Certification verification queue: view uploaded cert images, mark verified or reject
- Gym claim verification queue: approve/reject claims
- Platform metrics: total users, profiles, reviews pending/published, MRR from Stripe

### NOT in MVP (v2+):
- Trainer-to-Gym Matching section (design DB schema to support it later)
- Elite trainer tier ($69/mo)
- Gym Premium tier ($199/mo)
- In-app messaging
- Native mobile app
- Advanced analytics
- Certification auto-verification via ACE/NASM/ISSA APIs
- Photo uploads in reviews
- Referral/affiliate program
- Sponsored listings

---

## SECTION 5: USER FLOWS

### Flow 1: Consumer Finds a Trainer
Homepage → search "personal trainer [city]" or "near me" → Search Results (filters: type=trainer, specialty, rating) → Trainer Profile (views photo, bio, certs, reviews, VSL) → "Request a Free Consult" → contact form modal → submits → trainer receives email → consumer sees confirmation screen.

### Flow 2: Consumer Finds a Gym
Homepage → search → Search Results (type=gym) → Gym Profile (photos, hours, amenities, reviews, "Who Works Here") → clicks trainer in Who Works Here → Trainer Profile (Flow 1) OR clicks "Contact Gym" → contact form → gym receives email.

### Flow 3: Trainer Creates a Profile
"I'm a Trainer" CTA → account creation (name, email, password, type=trainer) → email verification → Profile Wizard (Step 1: basic info + photo; Step 2: certifications + specialties; Step 3: location + virtual toggle + booking link; Step 4: VSL video URL; Step 5: plan selection + Stripe) → Profile live → shareable URL shown → Trainer Dashboard.

### Flow 4: Trainer Receives Contact Request
Email notification → logs into dashboard → Contact Requests tab → sees sender name, email, message → "Reply via Email" (opens email client) OR copies booking link → follows up outside NextFit.

### Flow 5: Consumer Leaves a Review
Trainer shares review request link → consumer opens link → if not logged in: prompted to create account → Review form (overall stars + category ratings + written review + confirmation checkbox) → submitted to moderation queue → published within 24–48 hours → trainer notified via email.

### Flow 6: Gym Claims Their Profile
Finds stub listing → "Is this your gym? Claim this profile" → creates gym account → verification: (a) email domain match or (b) postcard with 6-digit code → profile unlocked → edit all fields → choose plan (Basic $49 or Verified $99) → Stripe → Verified badge.

### Flow 7: Gym Responds to a Review
Email notification of new review → Gym Dashboard → Reviews tab → "Respond to Review" → text field (max 500 chars) → response published below review labeled "Response from [Gym Name]".

### Flow 8: New Consumer Onboarding
First visit → homepage hero with search bar + three CTAs (Find a Trainer / Find a Gym / I'm a Fitness Pro) → browses results without login → clicks trainer profile → clicks "Request a Free Consult" → prompted to create free account (email/password or Google) → submits contact form.

---

## SECTION 6: FULL FEATURE SPEC WITH ACCEPTANCE CRITERIA

### 1. Authentication

**1.1 Registration**
- Email + password OR Google OAuth
- Email verification required before account is active
- Password minimum 8 characters
- Duplicate emails rejected with clear error
- Account type selected on registration: Consumer, Trainer/Coach, or Gym
- Account type determines post-registration dashboard and onboarding flow

**1.2 Login & Sessions**
- Login via email/password or Google OAuth
- "Remember me" = 30-day session
- JWT-based session tokens
- Auto-logout after 24 hours of inactivity

**1.3 Password Reset**
- "Forgot password" on login page
- Reset email within 60 seconds
- Link expires after 1 hour
- New password must differ from old

---

### 2. Trainer Profiles

**2.1 Profile Creation Wizard**
- Step 1: Full name, profile photo (REQUIRED — no silhouettes), bio (up to 500 chars)
- Step 2: Certifications (multi-select from list + "Other" free text), specialties (multi-select up to 10)
- Step 3: Location — search existing gym OR "Virtual Only"; virtual toggle; external booking URL (validated)
- Step 4: VSL video — paste YouTube or Vimeo URL, preview shown (optional)
- Step 5: Plan selection (Free / Starter / Pro) — Stripe Checkout if paid
- Profile published immediately after wizard
- Shareable URL: /trainer/[slug]

**Predefined certification list:** ACE, NASM, ISSA, CSCS, ACSM, RD, RDN, CPT, CES, PES, CFSC, FMS, CrossFit L1, CrossFit L2, Other

**Predefined specialty list:** Weight Loss, Strength Training, Sports Performance, Prenatal/Postnatal, Senior Fitness, Bodybuilding, Mobility & Flexibility, Nutrition Coaching, Group Fitness, Yoga, Pilates, Rehabilitation, Online Coaching

**2.2 Certifications**
- All trainer-added certs displayed on profile
- Unverified: neutral tag
- Verified: "NextFit Verified" checkmark badge (set by admin)
- Trainer uploads cert image for verification (stored, reviewed by admin)

**2.3 Public Profile Page**
- Publicly accessible without login
- Shows: photo, name, certs (with verification), specialties, bio, gym link, rating + review count, VSL embed, booking link button
- "Request a Free Consult" always visible
- Mobile responsive
- SEO meta tags: name, location, specialty in title/description
- Schema.org Person markup

**2.4 Trainer Dashboard**
- Edit all profile fields
- Contact requests list: name, date, message preview
- Reviews: published + pending
- Profile view count: 7-day and 30-day
- Copy profile link
- Subscription management (opens Stripe Customer Portal)

---

### 3. Gym Profiles

**3.1 Stub Listings**
- Show: name, address, city, state, phone
- "Unclaimed" badge displayed
- "Is this your gym? Claim this profile" CTA
- No photos/hours/pricing until claimed
- Not SEO-indexed until claimed (avoid thin content)

**3.2 Gym Claim Flow**
- Gym owner finds stub → clicks claim → creates/logs into Gym account
- Verification option A: email domain match (work email → verification link)
- Verification option B: postcard (6-digit code, 14-day expiry)
- After verification: full edit access, status = "Claimed"
- Pending claims show "Pending Verification" status

**3.3 Gym Profile Fields**
- Name, address, phone, website
- Hours: each day separately + closed option
- Up to 20 photos (JPEG/PNG, max 5MB each)
- Amenities checklist: Free Weights, Cardio Machines, Pool, Sauna, Steam Room, Group Fitness Studio, Basketball Court, Childcare, Parking, Locker Rooms, Towel Service, Nutrition Bar, Personal Training Available
- Pricing description (free text, max 300 chars)
- Classes offered (free text list)
- Social media links (optional)

**3.4 "Who Works Here"**
- Trainers self-link to gym via their profile
- Linked trainers shown as cards: photo, name, top specialty, rating, "View Profile"
- Gym cannot manually add trainers
- Empty state: "No trainers listed yet"

**3.5 Verified Badge**
- Shown on gym profiles at Verified tier ($99/mo) and above
- Visible on search result cards AND profile page

**3.6 Gym Dashboard**
- Edit all profile fields
- View + respond to reviews
- 7-day and 30-day profile view count
- List of linked trainer profiles
- Subscription management (Stripe Customer Portal)

---

### 4. Reviews

**4.1 Trainer Reviews**
- Requires logged-in Consumer account
- Fields: overall rating 1–5 (required), category ratings (Communication, Expertise, Motivation, Punctuality), written review (min 20 chars, max 1000 chars), confirmation checkbox ("I confirm I trained with this person")
- One review per user per trainer
- Editable within 48 hours of submission
- Goes to moderation queue
- Submitter receives confirmation email

**4.2 Gym Reviews**
- Same account requirement
- Fields: overall rating 1–5 (required), category ratings (Cleanliness, Equipment, Staff, Value), written review (min 20, max 1000 chars), confirmation checkbox
- One review per user per gym

**4.3 Review Moderation**
- All new reviews go to pending queue
- Admin actions: Approve / Reject (with reason) / Flag
- Rejected: automated email to submitter
- Target: approve within 24–48 hours

**4.4 Review Display**
- Reverse chronological order
- Overall star rating prominent (e.g., "4.8 ★ · 24 reviews")
- Category rating breakdown displayed
- Reviewer shown as first name + last initial (e.g., "Jordan M.")
- Date displayed
- Gym owner response shown below review, labeled "Response from [Gym Name]"

**4.5 Review Response (Gyms, Verified tier only)**
- One response per review
- Max 500 characters
- Editable within 48 hours

**4.6 Flag a Review**
- Any logged-in user can flag
- Flagged reviews added to admin queue
- Does NOT immediately remove review

---

### 5. Search & Discovery

**5.1 Homepage Search**
- Text search input + "Search" button
- "Use my location" geolocation option
- Returns results page with filters pre-populated

**5.2 Search Results Page**
- Card layout: photo, name, type badge, rating, location, top specialty
- Default sort: Top Rated
- Sort options: Top Rated, Most Reviewed, Nearest
- Filter panel (left sidebar desktop / drawer mobile):
  - Type: Gym, Personal Trainer, Group Fitness, Nutritionist/Dietitian, Wellness Coach, Physical Therapist
  - Specialty (multi-select)
  - Minimum rating: 3+, 4+, 4.5+
  - Availability: In-Person, Virtual, Both
  - Verified only toggle
- 20 results per page
- Zero results state with helpful message
- Filters update results dynamically without page reload

**5.3 SEO Landing Pages**
- Auto-generated for city + type + specialty combinations
- Example URLs: /personal-trainers/austin-tx, /gyms/nashville-tn, /weight-loss-trainers/denver-co
- Unique title tag, meta description, H1 per page
- Included in sitemap.xml

---

### 6. Contact & Booking

**6.1 "Request a Free Consult" — Trainer**
- Available on all trainer tiers
- Requires login to submit
- Pre-populated message (editable): "Hi [Trainer Name], I'm interested in learning more about your training services."
- On submit: trainer gets email with sender name, email, message; sender gets confirmation email; request logged in trainer dashboard

**6.2 "Contact Gym" Form**
- Available on claimed gym profiles
- Requires login
- Fields: name (auto-filled), email (auto-filled), subject dropdown (General Inquiry, Membership Info, Personal Training, Classes), message
- Gym receives email; sender receives confirmation

**6.3 Booking Link**
- Trainers on Starter+ can add external booking URL
- "Book a Session" button on profile opens external URL in new tab

---

### 7. Subscriptions & Payments

**7.1 Stripe**
- Stripe Checkout for initial subscription
- Stripe Customer Portal for plan changes, cancellation, payment method
- Webhooks: customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
- Failed payment → email notification → 7-day grace → downgrade to free

**7.2 Trainer Tiers**
- Free: profile visible, not searchable, no reviews shown
- Starter $19/mo: searchable, reviews shown, 1 specialty, contact form
- Pro $39/mo: all Starter + VSL, booking link, 5 specialties, view count analytics

**7.3 Gym Tiers**
- Unclaimed: stub only, not editable
- Basic $49/mo: full edit, photos, hours, amenities
- Verified $99/mo: verified badge, review responses, Who Works Here, view count analytics

---

### 8. Admin Panel (/admin)

**Access:** Protected route, admin role only

**8.1 User Management**
- List all users, filter by type/status/join date
- View profile details
- Suspend or delete accounts
- Trigger password reset email

**8.2 Review Moderation Queue**
- List pending reviews oldest-first
- View full content + reviewer account + profile being reviewed
- Approve / Reject (reason required) / Flag
- Rejection triggers email to submitter

**8.3 Certification Verification Queue**
- List trainers with uploaded cert docs
- View certificate image
- Mark Verified (adds badge) or Reject (emails trainer)

**8.4 Gym Claim Queue**
- List pending claims with verification method
- Approve or reject
- Track postcard send date + 14-day expiry

**8.5 Platform Metrics**
- Total users by type
- Total profiles (trainers, gyms, claimed gyms)
- Pending + published review counts
- MRR from Stripe
- New signups this week / month

---

### 9. Technical Requirements

**Performance**
- Page load < 3 seconds
- Search results < 1.5 seconds
- Images via CDN with lazy loading

**Mobile**
- Full functionality on iOS Safari + Chrome Android
- Touch targets minimum 44px
- Mobile-first design

**SEO**
- SSR or static generation for all public pages
- Schema.org: LocalBusiness (gyms), Person (trainers), Review
- sitemap.xml auto-generated
- Canonical URLs

**Security**
- HTTPS enforced
- bcrypt password hashing
- Rate limiting on forms and review submissions
- Input sanitization on all user-submitted fields
- GDPR cookie consent banner

**Database Schema Notes**
- Design the Prisma schema to support the Trainer-to-Gym Matching feature in v2 even though we're not building it yet. Gyms will need fields for: trainerFriendly (bool), memberFlowRating, compStructure (enum: SPLIT, HOURLY, OTHER), compRate (string), trainerAmenities (text). These can be nullable for v1.

---

### 10. Environment Variables Needed
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_TRAINER_STARTER_PRICE_ID
STRIPE_TRAINER_PRO_PRICE_ID
STRIPE_GYM_BASIC_PRICE_ID
STRIPE_GYM_VERIFIED_PRICE_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```
