# FitWell — User Flows

> Last Updated: April 14, 2026

---

## Flow 1: Consumer Finds a Trainer

**Persona:** Jordan (fitness seeker)
**Goal:** Find and contact a personal trainer near her

```
Landing Page
    ↓
Search bar: "personal trainer [city]" or clicks "Near Me"
    ↓
Search Results Page
    → Filters applied: Type = Personal Trainer, Specialty = Weight Loss, Rating = 4+ stars
    → Results sorted by Top Rated
    ↓
Trainer Profile Page
    → Views photo, bio, certifications, specialties
    → Watches VSL video
    → Reads client reviews
    → Sees "Available in-person at [Gym Name]"
    ↓
Clicks "Request a Free Consult"
    ↓
Contact Form Modal
    → Enters name, email, message
    → Submits
    ↓
Confirmation Screen
    "Your request has been sent! [Trainer Name] will be in touch soon."
    ↓
Trainer receives email notification with Jordan's message
```

---

## Flow 2: Consumer Finds a Gym

**Persona:** Jordan (fitness seeker)
**Goal:** Find a gym in her new neighborhood

```
Landing Page
    ↓
Search bar: "gym near me" or enters zip code
    ↓
Search Results Page
    → Filters applied: Type = Gym, Rating = 4+ stars
    ↓
Gym Profile Page
    → Views photos, hours, amenities, pricing
    → Reads member reviews (sorted by Most Recent)
    → Views "Who Works Here" — sees 3 linked trainer profiles
    ↓
Clicks trainer name in "Who Works Here"
    ↓
Trainer Profile Page (cross-linked from gym)
    → Continues as Flow 1
        OR
Clicks "Contact Gym"
    ↓
Contact Form
    → Enters name, email, question
    → Submits
    ↓
Gym receives email notification
```

---

## Flow 3: Trainer Creates a Profile

**Persona:** Marcus (independent trainer)
**Goal:** Build a public profile to get discovered

```
Landing Page
    ↓
Clicks "List Your Services" / "I'm a Trainer"
    ↓
Account Creation
    → Enters name, email, password
    → Selects account type: "Trainer / Coach"
    → Email verification sent
    ↓
Profile Setup Wizard — Step 1: Basic Info
    → Full name, profile photo, short bio (up to 300 chars)
    ↓
Profile Setup Wizard — Step 2: Credentials
    → Add certifications (select from list: ACE, NASM, ISSA, RD, CSCS, etc.)
    → Add specialties (multi-select: weight loss, strength, prenatal, etc.)
    → Years of experience
    ↓
Profile Setup Wizard — Step 3: Location & Availability
    → Search and link to a gym OR enter "Virtual Only"
    → Toggle "Virtual sessions available"
    → Enter external booking link (optional)
    ↓
Profile Setup Wizard — Step 4: VSL Video
    → Paste YouTube or Vimeo URL (optional)
    → Preview displays
    ↓
Profile Setup Wizard — Step 5: Choose a Plan
    → Free / Starter / Pro options displayed with feature comparison
    → Selects plan
    → If paid: enters payment info via Stripe
    ↓
Profile Published
    → "Your profile is live!" confirmation
    → Link to shareable public profile URL
    → Prompt: "Ask your clients to leave you a review"
    ↓
Trainer Dashboard (home base)
```

---

## Flow 4: Trainer Receives and Responds to a Contact Request

**Persona:** Marcus (trainer)
**Goal:** Follow up with a potential new client

```
Email Notification
    "New contact request from Jordan M. on FitWell"
    ↓
Clicks link in email → FitWell Login
    ↓
Trainer Dashboard → Contact Requests tab
    → Sees Jordan's name, email, and message
    → Clicks "Reply via Email" (opens default email client with pre-filled to/subject)
        OR
    → Clicks "Send Booking Link" (copies his Calendly link to clipboard)
    ↓
Marcus follows up with Jordan outside FitWell (v1)
    [In-app messaging is a v2 feature]
```

---

## Flow 5: Consumer Leaves a Review

**Persona:** Jordan (after working with Marcus for 6 weeks)
**Goal:** Leave a review for Marcus

```
Marcus sends Jordan a review request link (shareable URL from his dashboard)
    ↓
Jordan opens link → FitWell
    ↓
If not logged in:
    → Prompted to create a free account or log in
    ↓
Review Form — Trainer Review
    → Overall star rating (1–5)
    → Category ratings: Communication, Expertise, Motivation, Punctuality
    → Written review (required, min 20 characters)
    → "I confirm I trained with this person" checkbox
    ↓
Submits review
    ↓
Review enters moderation queue
    → Auto-approved if account is in good standing (v1: all go to manual queue)
    → Published within 24–48 hours
    ↓
Jordan sees confirmation: "Thanks! Your review helps others find great trainers."
    ↓
Marcus receives email: "You have a new review on FitWell!"
```

---

## Flow 6: Gym Claims Their Profile

**Persona:** Diane (gym owner)
**Goal:** Claim her gym's auto-generated listing and build it out

```
Diane searches her gym on FitWell → finds the stub listing
    ↓
Clicks "Is this your gym? Claim this profile"
    ↓
Account Creation or Login
    → Selects account type: "Gym / Studio"
    ↓
Claim Verification
    Option A: Email domain match
        → Enters work email (diane@[gymwebsite].com)
        → FitWell sends verification email to that address
        → Diane clicks confirmation link
    Option B: Postcard verification (if no matching domain)
        → FitWell mails a postcard with a 6-digit code
        → Diane enters code within 14 days
    ↓
Profile Unlocked — Edit Mode
    → Updates photos, hours, amenities, pricing, class schedule
    ↓
Choose a Plan
    → Basic Claim ($49/mo) or Verified ($99/mo) options shown
    → Selects Verified
    → Stripe payment
    ↓
Verified Badge Awarded
    ↓
Gym Dashboard (home base)
    → Can respond to reviews, view analytics, link trainers
```

---

## Flow 7: Gym Responds to a Review

**Persona:** Diane (gym owner)
**Goal:** Respond to a negative review professionally

```
Diane receives email: "You have a new review on FitWell"
    ↓
Logs into Gym Dashboard → Reviews tab
    → Sees 3-star review with complaint about parking
    ↓
Clicks "Respond to Review"
    ↓
Response text field
    → Enters response (max 500 characters)
    → Clicks "Post Response"
    ↓
Response published below the original review
    → Labeled "Response from [Gym Name]"
```

---

## Flow 8: New User Onboarding (Consumer — Homepage)

```
First Visit to FitWell.com
    ↓
Homepage
    → Hero section: "Find the Right Trainer or Gym Near You"
    → Search bar (text + geolocation option)
    → Three category CTAs: Find a Trainer | Find a Gym | I'm a Fitness Pro
    ↓
If clicks "Find a Trainer" without searching:
    → Redirected to search results with Type = Trainer pre-selected
    → Prompted to allow location or enter zip
    ↓
Browses results
    ↓
Clicks a trainer profile
    ↓
Views profile (no login required to view)
    ↓
Clicks "Request a Free Consult"
    ↓
Prompted to create a free account to send contact request
    → Quick signup: name, email, password
    → OR Google OAuth
    ↓
Contact form submitted (see Flow 1)
```

---

## Flow Summary

| Flow | User | Entry Point | Exit Point |
|---|---|---|---|
| 1 | Consumer | Homepage search | Consult request sent |
| 2 | Consumer | Homepage search | Gym contact sent or trainer profile |
| 3 | Trainer | "I'm a Trainer" CTA | Profile live + plan selected |
| 4 | Trainer | Email notification | Follow-up with client |
| 5 | Consumer | Review request link | Review published |
| 6 | Gym | Stub listing claim link | Verified profile + plan selected |
| 7 | Gym | Email notification | Review response published |
| 8 | Consumer (new) | Direct homepage visit | Account created + contact sent |
