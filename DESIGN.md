---
name: Rimaactive
description: Site de Marie Sillas, coach sportive à Houdan (78) — un corps fort et mobile grâce à une pratique fonctionnelle.
colors:
  craie: "#F4F3EF"
  blanc: "#FFFFFF"
  craie-fonce: "#E8E5DE"
  encre: "#161514"
  vermillon: "#FF4A1C"
  jaune-signal: "#F2C230"
  gris-chaud: "#57534E"
  filet: "#DCD9D2"
  gris-controle: "#88837B"
  voile-encre: "rgba(22, 21, 20, 0.82)"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "55px"
    fontWeight: 900
    lineHeight: "54px"
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 900
    lineHeight: "46px"
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 900
    lineHeight: "32px"
    letterSpacing: "-0.04em"
  accroche:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "30px"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
  small:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
  button:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.18em"
rounded:
  s: "8px"
  m: "16px"
  l: "24px"
  pill: "999px"
spacing:
  espace-1: "4px"
  espace-2: "8px"
  espace-3: "12px"
  espace-4: "16px"
  espace-5: "24px"
  espace-6: "32px"
  espace-7: "48px"
  espace-8: "64px"
  gouttiere: "clamp(20px, 5vw, 80px)"
  largeur: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.jaune-signal}"
    textColor: "{colors.encre}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.craie}"
  button-secondary:
    backgroundColor: "{colors.craie}"
    textColor: "{colors.encre}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.craie}"
  button-ink:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.craie}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
    height: "48px"
  button-ink-hover:
    backgroundColor: "{colors.jaune-signal}"
    textColor: "{colors.encre}"
  nav-bubble:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "30px"
  card-offer:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.m}"
    padding: "28px"
  input-field:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.s}"
    padding: "12px 16px"
    height: "52px"
---

# Design System: Rimaactive

## Overview

**Creative North Star: "Le carnet de séance"**

The site reads like a coach's training notebook, kept clean: a chalk-white page, black ink, one vermilion mark where it matters, and a yellow signal for the next action. It is sporty and dynamic in its type (heavy, tight Hanken Grotesk Black titles, short lines, big prices) and calm and reassuring in everything around it (warm neutral grounds, generous space, plain French, no visual noise). Marie in person is the product, so real photos of her carry the warmth; the interface stays out of the way.

Every section of the home page and of "Mes offres" is built to fit one screen, on a computer and on a phone, with a gentle scroll snap so a visitor always sees a section whole. Surfaces are flat and crisp at rest; the only movement is a short lift on hover and a soft slide when content changes. This system is the website expression of the Rimaactive charter validated by Marie on 29 October 2026; the charter is binding and wins over any generic style suggestion.

**Key Characteristics:**
- Chalk (#F4F3EF) and white grounds, ink text, never a dark full-page theme.
- One loud colour per screen: vermilion is a signature, yellow is an action.
- Hanken Grotesk only on the site: Black for titles, Regular for reading, italic only for the home tagline.
- Pill buttons and bubbles, 16px cards, flat at rest.
- Small spaced capitals only for surtitles, the menu and RIMAACTIVE.
- One section = one screen, desktop and phone.

## Colors

A warm, paper-like neutral base with exactly two vivid voices, each with a fixed job.

### Primary
- **Jaune signal** (#F2C230): action. Primary button, the "M'écrire" bubble, arrows of tiles on hover, active pagination dot. Always with ink text on it (10.9:1).

### Secondary
- **Vermillon** (#FF4A1C): signature. Logo and symbol, the underline of the active tab or menu item, big numbers and prices accents, the thick underline of a highlighted word on a light ground. As text only at 24px and above (3.0:1 on chalk); text placed on it is ink (5.4:1).

### Neutral
- **Craie** (#F4F3EF): main page ground, header bar, secondary button fill. No pink undertone.
- **Blanc** (#FFFFFF): every other section on the home page, cards, the offer detail dialog, form fields.
- **Craie foncé** (#E8E5DE): quiet surfaces: photo placeholders, inset boxes, the off state of a switch.
- **Encre** (#161514): all titles and body text, logo, icons, focus ring, hover fill of buttons; occasional dark band with chalk text.
- **Gris chaud** (#57534E): secondary text: paragraphs, captions, surtitles, inactive tabs (6.9:1 on chalk).
- **Filet** (#DCD9D2): decorative dividers and bubble outlines. Never the only border of a field.
- **Gris contrôle** (#88837B): borders of form fields (3.4:1 on chalk).
- **Voile encre** (rgba(22, 21, 20, 0.82)): gradient veil over photos, under chalk or yellow text.

### Named Rules
**The One Loud Colour Rule.** Only one vivid colour fills a large area on any screen. Vermilion signs, yellow acts; they never compete side by side as surfaces.

**The Yellow Never Reads Rule.** Yellow is never text on chalk or white (1.5:1). As text it only appears on a dark photo or the ink veil.

**The Alternating Ground Rule.** Home sections alternate chalk and white across the full width; cards switch to chalk on white sections so they stay visible.

## Typography

**Display Font:** Hanken Grotesk Black (900), with system-ui fallback
**Body Font:** Hanken Grotesk Regular (400) and SemiBold (600)
**Label Font:** Hanken Grotesk Bold (700), spaced capitals

**Character:** One family doing two jobs: compressed, heavy black titles that feel athletic and decisive, and an open, friendly regular for reading. Archivo Narrow belongs to documents and social posts, not to the site.

### Hierarchy
- **Display** (900, 55px / 54px, −0.045em): page titles. Phone: 36px / 38px.
- **Headline** (900, 44px / 46px, −0.045em): section titles on the home page, footer and contact page. Phone: 36px / 38px. Home page name title: 52px / 54px, −0.035em.
- **Title** (900, 32px / 32px, −0.04em): titles of tiles and offer cards.
- **Accroche** (400 italic, 22px / 30px): the home tagline only.
- **Body** (400, 16px / 26px): all reading text, in gris chaud, max 65ch. Never under 16px on a phone.
- **Small** (600, 14px / 20px): card infos, price prefixes, captions.
- **Button** (600, 15px / 20px): button labels; secondary buttons in 700.
- **Label** (700, 12px / 16px, 0.18em, uppercase): surtitles, menu bubbles, RIMAACTIVE, the "Mes offres" page label.
- **Price** (900, 56px / 56px, −0.05em): offer prices, the one place numbers get big.

### Named Rules
**The Sentence Case Rule.** Titles take one capital at the start and nothing else (proper names keep theirs). Capitals are reserved for the 12px spaced label style.

**The Same Size Rule.** Text of the same role has the same size and placement everywhere on a page. A section title on "Mes offres" never differs from its sibling sections.

## Layout

Content sits in a centred container of 1240px max with a fluid side gutter (clamp(20px, 5vw, 80px)). Two-column grids (text + photo) collapse to one column under 900px. On computers (≥ 900px), each home and offers section fills exactly one screen below the 45px header, content vertically centred, with `scroll-snap-type: y proximity`. Phones must also read section by section; compact rules exist for short screens (heights under 700px and 600px).

A scaling script in `index.html` exposes `--ecran` (usable screen height) and `--vw` so sizes stay proportional between laptop and large screens. Spacing follows the charter scale (4, 8, 12, 16, 24, 32, 48, 64px): 16px between paragraphs, 24px card padding and grid gutters, 32px between blocks, 48px between sections on phones, 64px on computers. Main breakpoints: 600/640px (phone type sizes), 760px, 900px (columns and full-screen sections), 1200px.

## Elevation & Depth

Flat and crisp. Depth comes from the ground change (chalk vs white) and from photos, not from shadows. A barely-there hairline shadow marks resting tiles; a real shadow only appears as a response to hover, together with a short upward lift, and for the offer detail dialog that floats over a dimmed page.

### Shadow Vocabulary
- **Repos** (`box-shadow: 0 1px 2px rgba(22, 21, 20, 0.06)`): resting tiles and bubbles on the hero.
- **Survol léger** (`box-shadow: 0 14px 32px rgba(22, 21, 20, 0.12)`): FAQ questions and price tiles on hover, with a 4px lift.
- **Survol** (`box-shadow: 0 18px 40px rgba(22, 21, 20, 0.14)`): offer cards and service tiles on hover, with a 6px lift.
- **Dialogue** (`box-shadow: 0 30px 80px rgba(22, 21, 20, 0.3)`): the offer detail dialog, over a backdrop of ink at 60%.

### Named Rules
**The Flat At Rest Rule.** Nothing floats until it is touched. Lifts use `cubic-bezier(.3, .7, .2, 1)` over 0.35s and are removed under `prefers-reduced-motion`.

## Shapes

Soft and sporty: everything you press is a full pill (999px), everything you read sits in a gently rounded card (16px), fields have small 8px corners. Large cards and the detail dialog go to 20–24px. Photos are rounded like cards, never tilted, never cut through Marie's face. Icons are Phosphor Light, thin ink strokes with no fill or colour, 20–32px.

## Components

### Buttons
Confident, round, one primary per screen.
- **Shape:** full pill (999px), minimum height 48px (42px compact), 2px border.
- **Primary:** jaune signal fill, ink label, 12px 22px padding. Hover: ink fill, chalk label.
- **Secondary:** chalk fill, 2px ink outline, bold ink label. Hover: ink fill, chalk label.
- **Ink:** ink fill, chalk label (used inside offer cards). Hover: yellow fill, ink label.
- **On photo:** chalk fill; hover turns transparent with a chalk outline. Contact links never turn vermilion.
- **Focus:** 2px solid ink ring, offset 2px (chalk ring on ink grounds).

### Navigation
- **Header:** 45px chalk bar, vermilion symbol logo on the left. Transparent with chalk outlines over the home photo.
- **Links (10 November 2026):** plain 14px semibold words in 30px pills, no outline. Current page: ink pill, chalk text. Hover: yellow rises from the bottom while the word rolls up to its double. No vermilion underline in the menu.
- **"M'écrire":** 32px yellow pill, 14px sentence-case label, arrow in an ink disc that turns 45° on hover.
- **Phone:** a menu button opens a full list; the current page reads in vermilion.

### Tabs ("Mes offres")
- Plain text links, 16px, gris chaud, no background or outline, 28px apart, in a sticky bar under the page label.
- Hover: ink. Current section: ink text with a 3px vermilion underline. Kept visibly distinct from the menu bubbles.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** white on chalk sections, chalk on white sections.
- **Shadow Strategy:** flat at rest, lift and "Survol" shadow on hover (see Elevation).
- **Internal Padding:** 28px for offer cards, 12px around photo tiles.
- **Content:** 14px semibold infos, big 56px black price with small 14px prefix/suffix, a filet divider, one "Voir le détail" action.

### Offer detail dialog
A white `<dialog>` (20px corners, max 880px wide) that must fit one screen on computer and phone. Left: surtitle, title, infos, price, short presentation and "Choisir cette formule". Right: "Comment ça se passe ?" and "Pour qui ?". Opens with a short 0.35s rise.

### Inputs / Fields
- **Style:** white fill, 1.5px gris contrôle border, 8px corners, 52px min height, 12px 16px padding; bold 16px labels above.
- **Hover:** chalk fill. **Focus:** 2px ink outline offset 2px and ink border.
- **Contact page exception (Marie, 10 November 2026):** softer fields, 1px filet border, 10px corners, 600 labels; offer bubbles with a filet outline (checked one in ink). "Envoyer" is a fixed-width 38px yellow pill beside the consent box; its arrow slides in on hover.

## Do's and Don'ts

### Do:
- **Do** use only the charter colours: craie #F4F3EF, blanc, craie foncé #E8E5DE, encre #161514, vermillon #FF4A1C, jaune signal #F2C230, gris chaud #57534E.
- **Do** keep one primary yellow button per screen, with ink text.
- **Do** make every section fit one screen on computer and phone, and check it at several sizes.
- **Do** keep the same size and placement for text of the same role across a page.
- **Do** use real photos of Marie in natural light, colour or clean black and white, with her face fully visible.
- **Do** write in French, with "vous", sentence-case titles and no emoji.

### Don't:
- **Don't** put yellow text on chalk or white.
- **Don't** use vermilion text under 24px, or chalk text on vermilion.
- **Don't** add blue, pink, neon, gradients other than the ink veil, or a second vivid colour on a large surface.
- **Don't** use capitals outside the 12px spaced label style.
- **Don't** tilt photos, add coloured filters, stock images, before/after shots or close-ups of bodies.
- **Don't** use dotted lines, gauges, labels, coloured blocks or coloured icons.
- **Don't** add a phone number, testimonials, figures or claims that Marie has not given.
