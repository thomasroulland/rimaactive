# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed by Marie (11 November 2026), all four are targets:

- **Private individuals around Houdan (78)** who want one-to-one sessions at home or in a gym, as single sessions or a monthly follow-up. Beginners and people returning to sport after a long break are welcome.
- **Small groups** (friends, neighbours, family) of 2 to 8 people, at home or outdoors, possibly with different levels.
- **Companies** that want sessions for their teams, up to 16 people, in their premises or outdoors (quote on request).
- **Remote clients anywhere** who want a programme and weekly follow-up online.

Most visitors arrive on a phone (from Instagram, Facebook, TikTok or word of mouth); companies are more likely on a computer.

## Product Purpose

Rimaactive is the coaching activity of Marie Sillas, a certified sports coach based in Houdan (Yvelines, 78). The site presents her, her method and her offers, and its single measure of success is that a visitor **writes to her through the contact form** to book or ask for a quote.

## Positioning

Confirmed by Marie: people choose her because

- **she comes to them**: sessions at home or in company premises, equipment provided, travel included up to 20 km around Houdan (beyond that, on quote);
- **functional training**: everyday movements, kettlebells, strength and mobility rather than machines;
- **tailored sessions**: built around each person's level and goals;
- **her background**: certified coach, karate practitioner, six years as an employee who saw colleagues with no time to look after themselves.

## Operating Context

- Area: Houdan (78), Yvelines, Eure-et-Loir (28) and Eure (27); online sessions anywhere.
- Every session lasts 60 minutes: mobility & activation, core of the session, cool-down / closing block.
- Equipment provided: mats, kettlebells, slam balls, etc.
- Contact only by the form and by e-mail (marie.sillas.coaching@outlook.com). Social: Instagram, Facebook, TikTok, all @rimaactive.
- Marie is developing a coaching follow-up tool (dashboard, programme, tracking); its screenshots will appear on the home page and a client area ("Mon espace") is planned but not built.

## Capabilities and Constraints

- Site: React 19 + Vite + react-router-dom, deployed on Vercel from `main` of `thomasroulland/rimaactive`.
- Pages: home (Accueil), offers on a single page (Mes offres, with sections Individuel, Groupes, Entreprises, En ligne), contact form (M'écrire), Mentions légales, CGV (empty, being written).
- Offers and prices (10 November 2026), source of truth in `src/pages/Particuliers.jsx`, `Groupes.jsx`, `Entreprises.jsx`, `EnLigne.jsx`:
  - at home: single session 70 €; monthly follow-up 260 € per month (4 sessions, i.e. 65 € each);
  - in a gym: single session 60 €; monthly follow-up 220 € per month (4 sessions, i.e. 55 € each);
  - groups (2 to 8 people): 70 € per session;
  - companies (up to 16 people): on quote, free quote within 48 h;
  - online monthly follow-up: 150 € for 3 months, or 3 × 50 €.
  - VAT not applicable, art. 293 B of the CGI.
- Tax credit for home services: shown on Individuel prices since 12 November 2026 at Marie's request (only the amounts she gave). Undecided: the contact form is not wired to an e-mail service yet, domain name not bought, CGV not written, legal details (SIRET, professional card, insurance, mediator) to complete.

## Brand Commitments

- The Rimaactive design system (chalk, ink, vermilion signature, signal yellow, Hanken Grotesk, Phosphor Light icons) is binding: layouts may change, the identity may not. See `PASSATION.md` § 3 and the design-system artefact it links.
- French, always **vous** (formal), no emoji, sentence case titles.
- **No phone number** anywhere.
- Desktop: every section must fit one screen; mobile must also read well section by section.

## Evidence on Hand

- Photos of Marie: `src/assets/portrait-contact.jpg` (arms crossed), `src/assets/portrait-marie.jpg`.
- Equipment photos: `src/assets/service-*.jpg`, `src/assets/heros-squat-nb.jpg`.
- Marie's own texts: "Qui suis-je", method principles, FAQ answers, session descriptions (in `src/pages/`).
- **None of these exist and must never be invented:** testimonials, client names or logos, figures or results, diploma name, prices other than those above, tax-credit claims, promises of results, nutrition advice.

## Product Principles

1. The goal of every page is a message from the visitor; make writing to Marie obvious and easy.
2. Marie in person is the product: her face, her words and her way of working come first.
3. Show the real offer honestly: real prices, real content of a session, nothing invented.
4. Simple and readable for non-specialists, on a phone first.
5. The identity is fixed; every change happens inside the existing design system.

## Accessibility & Inclusion

Plain French for a general audience; readable text sizes (16 px body); good contrast within the charter (yellow never as text on a light background); everything usable on a phone.
