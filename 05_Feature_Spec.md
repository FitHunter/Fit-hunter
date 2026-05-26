# FitWell — Full Feature Specification

> Last Updated: April 14, 2026
> Version: 1.0 (MVP)

---

## How to Read This Document

Each feature is described with:
- **What it does** — plain language description
- **User story** — who needs it and why
- **Acceptance criteria** — specific conditions that define "done"
- **Notes** — edge cases, constraints, or decisions

---

## 1. Authentication & Accounts

### 1.1 User Registration
**What it does:** Allows new users to create an account on FitWell.

**User story:** As a new visitor, I want to create an account so I can contact trainers and leave reviews.

**Acceptance criteria:**
- User can register with email + password
- User can register with Google OAuth
- Email verification is required before account is active
- Password must be minimum 8 characters
- Duplicate email addresses are rejected with a clear error message
- User selects account type on registration: Consumer, Trainer/Coach, or Gym

**Notes:** Account type determines which dashboard and onboarding flow the user sees post-registration.

---

### 1.2 Login & Session Management
**Acceptance criteria:**
- Login with email/password or Google OAuth
- "Remember me" option for 30-day session persistence
- Secure session tokens (JWT or equivalent)
- Auto-logout after 24 hours of inactivity

---

### 1.3 Password Reset
**Acceptance criteria:**
- "Forgot password" link on login page
- Reset email sent within 60 seconds
- Reset link expires after 1 hour
- New password must differ from previous password

---

## 2. Trainer & Coach Profiles

### 2.1 Profile Creation
**What it does:** Trainers complete a multi-step wizard to build their public profile.

**User story:** As a personal trainer, I want to create a profile that shows my certifications and specialties so potential clients can find and evaluate me.

**Acceptance criteria:**
- Step 1: Name, profile photo (required), bio (up to 500 characters)
- Step 2: Certifications (multi-select from predefined list + "Other" free text field)
- Step 3: Specialties (multi-select, up to 10, from predefined list)
- Step 4: Location — search and link to an existing gym OR mark as "Virtual Only"
- Step 5: "Virtual sessions available" toggle (can be on simultaneously with in-person)
- Step 6: External booking link (optional URL field, validated as a URL)
- Step 7: VSL video (optional — paste YouTube or Vimeo URL, preview shown)
- Step 8: Plan selection (Free, Starter, Pro)
- Profile is published immediately after wizard completion
- Trainer receives a shareable public URL (fitwell.com/trainer/[username-or-id])

**Notes:**
- Profile photo is required — no silhouette profiles
- Predefined certification list: ACE, NASM, ISSA, CSCS, ACSM, RD, RDN, CPT, CES, PES, CFSC, FMS, CrossFit L1/L2, others
- Predefined specialty list: Weight Loss, Strength Training, Sports Performance, Prenatal/Postnatal, Senior Fitness, Bodybuilding, Mobility & Flexibility, Nutrition Coaching, Group Fitness, Yoga, Pilates, Rehabilitation, Online Coaching

---

### 2.2 Certification Display & Verification
**What it does:** Certifications are displayed on a trainer's profile. Verified ones get a badge.

**Acceptance criteria:**
- All certifications the trainer adds are displayed
- Unverified certifications display with a neutral tag
- Verified certifications display with a "FitWell Verified" checkmark badge
- Verification happens via manual admin review in v1
- Trainers can submit verification by uploading a certificate image (stored, reviewed by admin)

**Notes:** Auto-verification via ACE/NASM/ISSA APIs is a v2 feature.

---

### 2.3 Profile Public Page
**Acceptance criteria:**
- Publicly accessible without login
- Displays: photo, name, certifications (with verification status), specialties, bio, location/gym link, rating summary, review count, VSL embed, booking link
- "Request a Free Consult" button always visible
- Mobile responsive
- Meta tags for SEO (name, location, specialty in title/description)

---

### 2.4 Trainer Dashboard
**Acceptance criteria:**
- Edit all profile fields
- View list of incoming contact requests (name, date, message preview)
- View all reviews (published and pending)
- View profile view count (last 7 days, last 30 days)
- Copy shareable profile link
- Manage subscription and billing

---

## 3. Gym Profiles

### 3.1 Auto-Generated Stub Listings
**What it does:** FitWell pre-populates basic gym listings from public data so consumers have results from day one.

**Acceptance criteria:**
- Stub listings show: name, address, city, state, phone (if available)
- Stub listings display "Unclaimed" badge
- "Is this your gym? Claim this profile" CTA is visible
- No photos, pricing, or hours until claimed

**Notes:** Initial data sourced from Google Places API or manual entry during city launch. Stubs are not indexed for SEO until claimed to avoid thin content penalties.

---

### 3.2 Gym Claim Flow
**Acceptance criteria:**
- Gym owner searches for their gym and clicks "Claim this profile"
- Creates a Gym account or logs in
- Verification via: (a) email domain match — enters work email, receives verification link; or (b) postcard — mailed to gym address, 6-digit code
- After verification, gym owner can edit all profile fields
- "Claimed" status replaces "Unclaimed" badge
- Unverified claims (awaiting postcard) show "Pending Verification" status

---

### 3.3 Gym Profile Fields
**Acceptance criteria:**
- Gym name, address, phone, website URL
- Hours of operation (each day separately, closed option)
- Up to 20 photo uploads (JPEG/PNG, max 5MB each)
- Amenities checklist (free weights, cardio machines, pool, sauna, steam room, group fitness studio, basketball court, childcare, parking, locker rooms, towel service, nutrition bar, personal training available)
- Pricing description (free text, up to 300 characters — e.g., "Starting at $35/mo, no contract")
- Classes offered (free text list)
- Social media links (optional)

---

### 3.4 "Who Works Here" Section
**What it does:** Displays trainer profiles linked to this gym.

**Acceptance criteria:**
- Trainers can add a gym to their profile (links them to that gym)
- Linked trainers appear as cards in the gym's "Who Works Here" section
- Each card shows: trainer photo, name, top specialty, rating, "View Profile" button
- Gym cannot add trainers manually — trainers must self-link
- If no trainers are linked, section displays "No trainers listed yet"

---

### 3.5 Verified Badge
**Acceptance criteria:**
- "Verified" badge displayed on profiles of gyms on the Verified ($99/mo) or higher tier
- Badge is visible on search results cards and on the gym profile page

---

### 3.6 Gym Dashboard
**Acceptance criteria:**
- Edit all profile fields
- View and respond to reviews
- View profile view count (7-day, 30-day)
- View list of linked trainer profiles
- Manage subscription and billing

---

## 4. Reviews

### 4.1 Review Submission — Trainer
**Acceptance criteria:**
- User must be logged in (Consumer account) to submit a review
- Review form fields: overall rating (1–5 stars, required), category ratings (Communication, Expertise, Motivation, Punctuality — 1–5 stars each), written review (required, min 20 chars, max 1000 chars), "I confirm I worked with this trainer" checkbox (required)
- One review per user per trainer (can edit within 48 hours of submission)
- Reviews are submitted to a moderation queue before publishing
- Submitter receives confirmation email

---

### 4.2 Review Submission — Gym
**Acceptance criteria:**
- Same account requirement as trainer reviews
- Review form fields: overall rating (required), category ratings (Cleanliness, Equipment, Staff, Value — 1–5 stars each), written review (required, min 20 chars, max 1000 chars), "I confirm I was a member or visited this gym" checkbox (required)
- One review per user per gym

---

### 4.3 Review Moderation
**Acceptance criteria:**
- All new reviews enter a pending queue
- Admin can Approve, Reject, or Flag for follow-up
- Rejected reviews trigger an email to the submitter explaining removal
- Approved reviews publish within 24–48 hours (SLA goal)
- Auto-approval is a v2 feature

---

### 4.4 Review Display
**Acceptance criteria:**
- Reviews displayed in reverse chronological order by default
- Overall star rating shown prominently (e.g., 4.8 ★ · 24 reviews)
- Category breakdown shown as a sub-rating section
- Reviewer shown as first name + last initial (e.g., "Jordan M.")
- Date of review displayed
- Gym owner response displayed directly below the original review, labeled "Response from [Gym Name]"

---

### 4.5 Review Response (Gyms Only)
**Acceptance criteria:**
- Gym owners (Verified tier and above) can respond to reviews
- One response per review
- Response max 500 characters
- Response can be edited within 48 hours
- Trainer response to reviews is a v2 feature

---

### 4.6 Flag / Report a Review
**Acceptance criteria:**
- Any logged-in user can flag a review as inappropriate
- Flagged reviews are added to admin moderation queue
- Flagging does not immediately remove the review

---

## 5. Search & Discovery

### 5.1 Homepage Search
**Acceptance criteria:**
- Text input + "Search" button on homepage hero
- "Use my location" / "Near me" geolocation option
- Searches return results page with filters pre-populated

---

### 5.2 Search Results Page
**Acceptance criteria:**
- Results displayed as cards (photo, name, type badge, rating, location, top specialty)
- Default sort: Top Rated
- Sort options: Top Rated, Most Reviewed, Nearest
- Filter panel (left sidebar on desktop, drawer on mobile):
  - Type (multi-select): Gym, Personal Trainer, Group Fitness, Nutritionist/Dietitian, Wellness Coach, Physical Therapist
  - Specialty (multi-select from predefined list)
  - Rating minimum: 3+, 4+, 4.5+
  - Availability: In-Person, Virtual, Both
  - Verified only: toggle (shows only verified gyms + certified-verified trainers)
- Pagination (20 results per page) or infinite scroll
- Zero results state: "No results found. Try a different location or adjust your filters."
- Results update dynamically as filters change (no page reload)

---

### 5.3 Search SEO Pages
**What it does:** Pre-rendered pages for common search queries to drive organic traffic.

**Acceptance criteria:**
- Auto-generated pages for combinations of city + type + specialty
- Examples: "Personal Trainers in Austin TX", "Weight Loss Trainers in Denver CO", "Gyms in Nashville TN"
- Each page has unique title tag, meta description, H1
- Pages are indexed and linked from sitemap

---

## 6. Contact & Booking

### 6.1 "Request a Free Consult" — Trainer
**Acceptance criteria:**
- Available on all trainer profiles (Free tier and above)
- User must be logged in to submit
- Form fields: message (pre-populated with "Hi [Trainer Name], I'm interested in learning more about your training services."), editable
- On submit: trainer receives email with sender's name, email, and message
- Sender receives confirmation email
- Contact request logged in trainer's dashboard

---

### 6.2 "Contact Gym" Form
**Acceptance criteria:**
- Available on all claimed gym profiles
- User must be logged in
- Form fields: name (auto-filled), email (auto-filled), subject (dropdown: General Inquiry, Membership Info, Personal Training, Classes), message
- Gym receives email notification
- Sender receives confirmation

---

### 6.3 Booking Link Integration
**Acceptance criteria:**
- Trainers on Starter tier and above can add an external booking link
- Button on profile: "Book a Session" or custom label (trainer can set)
- Clicking opens the external URL in a new tab
- No iframe embedding in v1

---

## 7. Subscriptions & Payments

### 7.1 Stripe Integration
**Acceptance criteria:**
- All payment processing via Stripe
- Stripe Checkout used for initial subscription
- Stripe Customer Portal used for billing management (plan changes, cancellation, payment method update)
- Webhooks handle subscription status changes (active, canceled, past_due)
- Failed payments trigger email notification + grace period (7 days before downgrade to free)

---

### 7.2 Trainer Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| Free | $0 | Profile visible, certifications listed, not searchable, no reviews shown |
| Starter | $19/mo | Fully searchable, reviews displayed, 1 specialty shown, contact form |
| Pro | $39/mo | All Starter features + VSL video, booking link, 5 specialties, profile view count |

**Acceptance criteria:**
- Plan comparison table shown during signup and in dashboard
- Downgrade takes effect at end of billing period
- Upgrade takes effect immediately (prorated charge)

---

### 7.3 Gym Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| Unclaimed | $0 | Stub listing, not fully editable |
| Basic Claim | $49/mo | Full profile edit, photos, hours, amenities |
| Verified | $99/mo | Verified badge, review responses, "Who Works Here", analytics |

---

## 8. Admin Panel

### 8.1 User Management
**Acceptance criteria:**
- List all users with filters (type, status, join date)
- View user profile details
- Suspend or delete accounts
- Reset user password (sends reset email)

---

### 8.2 Review Moderation Queue
**Acceptance criteria:**
- List of pending reviews (oldest first)
- View full review content, reviewer account, and profile being reviewed
- Actions: Approve, Reject (with reason), Flag for follow-up
- Rejected review triggers automated email to reviewer

---

### 8.3 Certification Verification Queue
**Acceptance criteria:**
- List of trainers who have submitted certification docs for verification
- Admin can view uploaded certificate image
- Actions: Mark as Verified (adds badge to profile), Reject (sends email to trainer)

---

### 8.4 Gym Claim Queue
**Acceptance criteria:**
- List of pending gym claims
- Shows claim method (email domain or postcard)
- Admin can manually approve or reject claims
- Postcard verification: admin enters when postcard has been sent, sets 14-day expiry

---

### 8.5 Platform Metrics Dashboard
**Acceptance criteria:**
- Total registered users (by type)
- Total profiles (trainers, gyms, claimed gyms)
- Total reviews (pending, published)
- MRR (monthly recurring revenue, pulled from Stripe)
- New signups this week / this month

---

## 9. Technical Requirements

### 9.1 Performance
- Page load time < 3 seconds on a standard connection
- Search results < 1.5 seconds
- Images served via CDN with lazy loading

### 9.2 Mobile Responsiveness
- Full functionality on mobile browsers (iOS Safari, Chrome Android)
- Touch-friendly UI (tap targets minimum 44px)
- Mobile-first design approach

### 9.3 SEO
- Server-side rendering or static generation for all public pages
- Structured data markup (Schema.org) for LocalBusiness, Person, Review
- Sitemap.xml auto-generated and submitted to Google Search Console
- Canonical URLs on all pages

### 9.4 Security
- HTTPS enforced across all pages
- Passwords hashed with bcrypt
- Rate limiting on contact forms and review submissions
- Input sanitization on all user-submitted text fields
- GDPR-compliant privacy policy and cookie consent banner

### 9.5 Hosting & Infrastructure
- Recommended stack for Claude Code build: Next.js (React) frontend, Node.js/Express or Next.js API routes backend, PostgreSQL database, Cloudinary or AWS S3 for image storage, Stripe for payments, SendGrid or Resend for transactional email, Vercel or Railway for deployment

---

## 10. Out of Scope for v1 (Documented for v2 Planning)

- Trainer-to-Gym Matching section (full feature)
- In-app messaging between users and trainers
- Native iOS and Android apps
- Advanced analytics dashboards
- Certification auto-verification via ACE/NASM/ISSA APIs
- Photo uploads within reviews
- Referral and affiliate program
- Sponsored / promoted listings
- Multi-location gym management
- Trainer team profiles (group practice listings)
