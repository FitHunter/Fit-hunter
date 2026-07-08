# Master Prompt — NextFit Homepage Redesign (Bold & Athletic)

> Paste everything below the line into Fable 5. It is written to be run against
> this repo with file access. Goal: transform the homepage from amateur to a
> professional, brand-grade fitness marketplace — and establish a reusable
> design system in the process.

---

You are a senior product designer and front-end engineer redesigning the
homepage of **NextFit**, a fitness marketplace that connects consumers with
personal trainers and gyms. Your job is to take the current homepage from
"rookie side-project" to "funded brand launch" — while keeping every piece of
functionality working. This is a **proof-of-system pass**: you are redesigning
one page, but you are building the design foundation (tokens, type scale,
spacing, component patterns) that the rest of the site will inherit later.

## The product (so the design has a point of view)
NextFit lets people search for trainers and gyms by location, style, and
specialty, read real moderated reviews, and contact professionals. Trainers and
gyms pay for profiles. The homepage's job is to make a consumer instantly
trust the platform and start a search, and to make a fitness pro want to sign up.
Design for *trust + energy*, not just decoration.

## Tech context
- **Next.js 14 (App Router)**, TypeScript, Tailwind CSS, Radix UI, `lucide-react` icons.
- Homepage: `src/app/page.tsx`
- Global styles / tokens: `src/app/globals.css`
- Tailwind theme: `tailwind.config.ts`
- Root layout + fonts: `src/app/layout.tsx`
- Shared chrome: `src/components/layout/navbar.tsx`, button primitives in `src/components/ui/button.tsx`
- The hero search is a working client component: `src/components/homepage-search.tsx` — **preserve its behavior**.
- Run the dev server and view your work in the browser as you go. Do not judge the result from code alone.

## Fix these specific problems in the current build (they are the amateur tells)
1. **The uppercase hammer.** `globals.css` forces *every* `h1–h4` to
   `text-transform: uppercase`, serif font, and `font-weight: 500 !important`.
   The `!important` silently overrides `font-bold` in components. Replace this
   blunt global rule with a real, intentional typographic system. Note: this
   rule affects the whole site, so introduce the new system cleanly (tokens +
   component classes) rather than leaving other pages broken.
2. **The disguised color system.** The brand navy palette is currently jammed
   into Tailwind's `emerald-*` slots (so `emerald-600` renders navy). Rip this
   out and build **real semantic tokens** (e.g. `primary`, `accent`, `surface`,
   `muted`, `foreground`, `border`) so color has meaning and future pages are
   maintainable.
3. **Broken dark mode.** `globals.css` defines dark-mode CSS variables but
   `layout.tsx` hardcodes `bg-gray-50 text-gray-900` on the body, so dark mode
   is half-wired. Either implement dark mode properly end-to-end, or commit
   fully to a single polished light theme. No half-states.
4. **No button hierarchy.** The "Are you a fitness professional?" section has
   two identical white buttons. Establish clear primary / secondary / tertiary
   button roles and use them with intent.
5. **No spacing rhythm.** Sections use ad-hoc `py-12 / py-14 / py-16`. Define a
   spacing/vertical-rhythm scale and apply it consistently.
6. **"Three identical cards" syndrome.** Both the 3 CTAs and the 3 value props
   are centered cards with a circle-icon-on-top. This is the #1 generic-template
   look. Redesign these with real visual hierarchy and asymmetry (see below).

## Design direction: Bold & Athletic (disciplined, not loud-for-loud's-sake)
Reference the confidence of **Nike, Whoop, Gymshark, Alo Moves** — strong type,
decisive color, dynamic imagery, generous negative space. The line you must walk:
*athletic energy without looking like a generic template or an AI mockup.*

Concrete rules:
- **Typography:** Replace the serif-uppercase treatment with a strong athletic
  type system. Pair a heavy, confident display face (a bold grotesque or
  condensed sans — e.g. Archivo/Archivo Expanded, Anton for hero-scale numerals,
  or a similar workhorse) with a clean, highly legible body sans (Inter, Geist,
  or similar). Build a real modular type scale (display → h1 → h2 → h3 → body →
  small) with deliberate weights, line-heights, and tracking. Big type is
  allowed and encouraged — but only at intentional focal points.
- **Color:** Near-black / deep charcoal base + off-white, plus **one** saturated
  athletic accent used sparingly for energy and CTAs (e.g. electric volt, a
  strong orange, or a confident red — pick one and commit). Neutrals do the
  heavy lifting; the accent earns attention. Define these as semantic tokens.
- **Layout:** Break the centered-everything pattern. Use an editorial grid,
  asymmetry, oversized numerals or headlines, and full-bleed imagery with
  intentional crops. Let sections have distinct rhythm rather than uniform
  stacked blocks.
- **Imagery:** Treat photos consistently (a shared grade / duotone / overlay
  system) so the page feels art-directed, not stock-photo-random. The existing
  hero image URL may be reused, but its treatment should feel intentional.
- **Motion:** Subtle and purposeful — scroll-reveal, meaningful hover feedback,
  a confident hero. No bouncy defaults, no gratuitous animation.
- **Detail craft:** One consistent border-radius scale. One shadow system
  (not `shadow-md hover:shadow-lg` slapped on everything). Real, visible focus
  states. Consistent icon weight and size.

## Hard bans (these are what "AI slop" looks like — do not produce them)
- Generic gradient-mesh / blurry blob backgrounds.
- Purple-to-blue or rainbow gradients.
- Emoji used as section icons or bullets.
- Rows of three identical centered cards with a circle-icon-on-top.
- Glassmorphism everywhere; frosted cards as a crutch.
- Everything center-aligned with uniform spacing and no hierarchy.
- Vague filler copy ("Empower your journey", "Seamlessly connect", "Elevate
  your fitness"). Write specific, confident, human copy.
- Inconsistent radii, shadows, and spacing across sibling elements.

## Functionality guardrails (do not break these)
- Preserve `HomepageSearch` and all its behavior (search submission, "use my
  location", routing to `/search`). Restyle it, don't rewrite its logic.
- Keep every existing route/link working: `/search?type=PERSONAL_TRAINER`,
  `/search?type=GYM`, `/register?type=TRAINER`, `/register`, `/login`,
  `/search`.
- The navbar and footer may be restyled to match the new system, but keep all
  links, the auth/session logic, and the mobile menu fully functional.
- Keep the page responsive: verify mobile, tablet, and desktop. Mobile-first.
- Maintain accessibility: semantic headings, keyboard-navigable interactive
  elements, visible focus, sufficient contrast, meaningful alt text.
- TypeScript must compile and the app must build (`npm run build`).

## Functionality verification — every button, every flow (WHOLE-SITE scope)
This is a top priority and its scope is **broader than the visual redesign**.
The homepage gets the visual overhaul; the *functional audit covers the entire
app*. A beautiful page that dead-ends on a broken button is a failure.

**How to verify (non-negotiable): actually exercise each flow in a running
browser.** Do not infer "it works" from reading code. Start the dev server,
create/use a test account, click the real buttons, submit the real forms, and
observe the real result (navigation, network response, DB write, toast, error).
For every flow, classify it as one of:
- ✅ **Verified working** — you drove it end-to-end and saw the correct outcome.
- 🔧 **Was broken → fixed** — describe the bug and the fix.
- ⚠️ **Couldn't fully test** — say exactly why (e.g. missing Stripe test keys,
  email provider not configured) and what's needed to test it.

Walk every user journey below and confirm each button, link, form, loading
state, empty state, error state, and success state behaves correctly:

**Consumer discovery**
- Homepage search: type a query → Search → lands on `/search` with the query applied and results render.
- "Use my location": on **allow**, it geolocates and routes to `/search` with results; on **deny/error/timeout**, it currently fails silently — the user must get clear feedback (message/toast) and the button must reset. Fix this.
- Homepage path cards ("Find a Trainer", "Find a Gym", "I'm a Fitness Pro") route to the correct destinations.
- Search page: filters/params work, results render, empty-result state is handled, clicking a result opens the right trainer/gym profile.
- City autocomplete (`/api/geocode/city-search`) returns and selects correctly.

**Account setup & auth**
- Register as consumer, as trainer (`/register?type=TRAINER`), and as gym — each creates the account and routes correctly.
- Email verification (`/api/auth/verify-email`) flow works or is clearly reported if email delivery isn't configured.
- Login routes each role to the correct place (trainer → `/dashboard/trainer`, gym → `/dashboard/gym`, admin → `/admin`).
- Forgot-password → reset-password round trip works end to end.
- Logout (navbar) clears the session and redirects home.
- Form validation: bad input is rejected with visible errors; forms can't be double-submitted; loading states show.

**Trainer journey**
- Trainer setup wizard (`/dashboard/trainer/setup`) completes and saves.
- Edit profile (`/dashboard/trainer/edit` → `/api/trainer/profile`) persists changes.
- Photo upload (`/api/trainer/photos`, `/api/upload/image` → Cloudinary) works or is reported.
- Subscription checkout (`/api/stripe/checkout`) and billing portal (`/api/stripe/portal`) work or are reported if keys are absent.

**Reviews, contact, gym & admin**
- Contact a trainer (`/api/contact/trainer`) and a gym (`/api/contact/gym`) — messages submit and confirm.
- Write a review (trainer & gym `write-review` pages → `/api/review`) and flag a review (`/api/review/flag`).
- Gym dashboard (`/dashboard/gym`) loads and its actions work.
- Admin panel + review moderation (`/admin/reviews` → `/api/admin/review/moderate`).

**Cross-cutting checks**
- Navbar: all links, the profile dropdown, role-based dashboard routing, and the mobile menu work (open/close, keyboard, outside-click).
- Every `<Button>`/link on the homepage goes somewhere real — no dead ends, no `#` placeholders.
- No console errors or failed network requests during any flow.

**Fix what's broken.** Where a flow is blocked only by missing configuration
(Stripe test keys, email provider, DB seed data), do not fake it — report it
clearly with the exact env/setup needed. Deliver a checklist of every flow with
its ✅ / 🔧 / ⚠️ status.

## Workflow (follow in order)
1. **Audit** the current homepage in the browser and read the files above.
2. **Establish the system first:** define color tokens, type scale, spacing
   scale, radius + shadow scales in `globals.css` / `tailwind.config.ts`.
   Remove the `!important` uppercase rule and the emerald-slot color hack.
3. **Rebuild the homepage section by section** (hero → search → primary paths →
   value props / trust → pro CTA → footer), applying the system. Redesign the
   card sections rather than restyling them.
4. **View every change in the browser.** Iterate on real rendering, not code.
5. **Check responsive** at mobile / tablet / desktop and fix reflow issues.
6. **Resolve the dark-mode decision** (full support or single polished theme).
7. **Run the full functionality audit** (see the whole-site section above):
   drive every flow in the browser, fix what's broken, and produce the ✅ / 🔧 /
   ⚠️ checklist.
8. **Verify:** `npm run build` passes, all links work, search works, no console
   errors.

## Definition of done
- The homepage looks like it belongs to a funded, professional fitness brand —
  bold and athletic, with real hierarchy and craft, and none of the hard-ban
  tells.
- A coherent, documented design system exists (tokens + scales + component
  patterns) that other pages can adopt without rework.
- Every link, the search, the navbar, and the mobile menu still work; the build
  passes; the page is responsive and accessible.
- **The whole-site functionality audit is complete**: every flow from account
  setup to "find trainers near me" has been driven in a browser and carries a
  ✅ / 🔧 / ⚠️ status, with every fixable bug fixed and every blocker reported.
- Before finishing, list what you changed, the design decisions you made (fonts,
  accent color, type scale), and exactly how the next page should reuse this
  system.
