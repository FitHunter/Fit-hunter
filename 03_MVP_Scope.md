# FitWell — MVP Scope

> Last Updated: April 14, 2026

---

## MVP Philosophy

The MVP is the smallest version of FitWell that delivers real value to all three core user groups (consumers, trainers, gyms) and is worth paying for. It proves the core loop: **someone searches → finds a trainer or gym → contacts them → leaves a review.**

Everything else comes after this loop works.

---

## What's IN the MVP (v1.0)

### Authentication & Accounts
- [ ] Consumer account creation (email + password, Google OAuth)
- [ ] Trainer/Coach account creation with profile type selection
- [ ] Gym account creation
- [ ] Email verification
- [ ] Password reset flow
- [ ] Basic profile settings (name, email, password, profile photo)

---

### Trainer Profiles
- [ ] Profile creation wizard (name, bio, photo, certifications, specialties, location)
- [ ] Certification input (manual entry for v1 — verification badge earned after manual review)
- [ ] Specialty tags (select from predefined list: weight loss, strength, prenatal, sports performance, nutrition, senior fitness, mobility, online coaching)
- [ ] In-person location field (link to gym or enter address)
- [ ] "Virtual sessions available" toggle
- [ ] VSL video embed (YouTube/Vimeo link — no self-hosting in v1)
- [ ] External booking link field (Calendly, Acuity, etc.)
- [ ] "Request a Free Consult" contact form (sends email to trainer)
- [ ] Public profile page with shareable URL

---

### Gym Profiles
- [ ] Gym listing creation (name, address, phone, website, hours)
- [ ] Photo upload (up to 10 photos)
- [ ] Amenities checklist (weights, cardio, pool, sauna, group classes, parking, etc.)
- [ ] Pricing info field (free text in v1)
- [ ] Classes offered (free text list in v1)
- [ ] "Who Works Here" section — trainer profiles linked by trainers who add the gym to their profile
- [ ] Claim flow — gym owners can claim an existing listing and verify ownership via email domain match or postcard verification
- [ ] Verified badge displayed after successful claim

---

### Reviews
- [ ] Star rating + written review for trainers (1–5 stars)
- [ ] Star rating + written review for gyms (1–5 stars)
- [ ] Review submission requires a FitWell account
- [ ] Trainer-specific rating categories: communication, expertise, motivation, punctuality
- [ ] Gym-specific rating categories: cleanliness, equipment, staff, value
- [ ] Review moderation queue (manual review before publishing in v1)
- [ ] "Flag review" button for inappropriate content
- [ ] Average rating displayed on profile

---

### Search & Discovery
- [ ] Search bar on homepage (text search by name, city, zip)
- [ ] "Near me" geolocation search
- [ ] Filter by type: gym, personal trainer, group instructor, nutritionist, wellness coach
- [ ] Filter by specialty
- [ ] Filter by rating (minimum star threshold)
- [ ] Filter by virtual vs. in-person
- [ ] Search results page with card-based layout (photo, name, rating, location, top specialty)
- [ ] Sort by: Top Rated, Most Reviewed, Nearest

---

### Contact & Messaging
- [ ] "Request a Free Consult" form on trainer profiles (name, email, message → email notification to trainer)
- [ ] "Contact Gym" form on gym profiles
- [ ] Trainer receives email notification for each contact request
- [ ] Basic contact request log in trainer dashboard

---

### Trainer Dashboard
- [ ] Edit profile
- [ ] View incoming contact requests
- [ ] View reviews left for them
- [ ] See profile view count (basic analytics)
- [ ] Manage subscription tier

---

### Gym Dashboard
- [ ] Edit gym profile
- [ ] View and respond to reviews
- [ ] See profile view count
- [ ] View linked trainer profiles
- [ ] Manage subscription tier

---

### Subscriptions & Payments
- [ ] Stripe integration for subscription billing
- [ ] Trainer tiers: Free, Starter ($19/mo), Pro ($39/mo)
- [ ] Gym tiers: Unclaimed (free stub), Basic ($49/mo), Verified ($99/mo)
- [ ] Upgrade/downgrade flow
- [ ] Billing history page
- [ ] Cancel subscription flow

---

### Admin Panel (Internal)
- [ ] View and manage all user accounts
- [ ] Review moderation queue (approve / reject reviews)
- [ ] Certification verification queue (manually mark trainers as verified)
- [ ] Gym claim verification queue
- [ ] Basic platform metrics (total users, total reviews, MRR)

---

## What's NOT in the MVP (v2+)

These features are real and valuable but should wait until the core loop is proven:

| Feature | Why It's Deferred |
|---|---|
| Trainer-to-Gym Matching section | Valuable but complex — needs gym density first |
| Elite trainer tier | Add after Pro adoption is validated |
| Gym Premium tier | Add after Verified adoption is validated |
| Pay-per-lead model | Needs traffic volume to be worth building |
| Certification auto-verification (ACE/NASM API) | API access takes time — manual process in v1 |
| In-app messaging | Email notifications sufficient for v1 |
| Photo uploads in reviews | Adds complexity — text reviews first |
| Native mobile app (iOS/Android) | Build web-first, then go mobile |
| Analytics dashboard (advanced) | Basic view counts in v1, deeper analytics in v2 |
| Nutrition-specific category pages | Add when nutrition coach density is sufficient |
| SSO / social login beyond Google | Add based on demand |
| Referral program | Post-launch growth feature |
| Sponsored placements / advertising | Year 2 revenue stream |

---

## MVP Success Metrics

Before calling v1 a success and moving to v2, hit these benchmarks:

| Metric | Target |
|---|---|
| Trainer profiles created | 100+ |
| Gym profiles (claimed) | 20+ |
| Reviews submitted | 50+ |
| Paying trainer subscriptions | 30+ |
| Consumer searches per week | 200+ |
| Contact requests sent | 25+ per month |

---

## Launch Strategy

**Phase 1 — Single City Beta**
Pick one mid-size city (e.g., Austin, Nashville, Denver) with a strong fitness culture. Manually seed trainer and gym profiles. Recruit 20–30 trainers to create profiles before launch.

**Phase 2 — Soft Launch**
Open to the public in that city. Drive consumer traffic through local fitness Facebook groups, Reddit (r/fitness, city subreddits), and Instagram outreach.

**Phase 3 — Iterate**
Fix the biggest friction points from real user behavior before expanding to a second city.

**Phase 4 — Expand**
Roll out to additional cities one at a time, applying the same seeding playbook.
