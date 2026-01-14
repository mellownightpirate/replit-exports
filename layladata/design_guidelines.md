# Design Guidelines: The Art of Data: After Dark

## Design Approach
**Reference-Based Approach**: Drawing inspiration from premium event landing pages and gallery aesthetics. Think immersive theatre experiences, high-end private view invitations, and luxury event platforms - intimate, cinematic, mysterious with warm dark aesthetics.

## Core Design Principles
- **Candlelit Gallery Atmosphere**: Dark, warm, inviting rather than harsh or cold
- **Premium Calm**: Generous spacing, no clutter, sophisticated restraint
- **Cinematic Storytelling**: Each section builds the narrative of an exclusive, intimate salon
- **Human & Conversational**: Approachable sophistication without corporate stiffness

## Typography System

**Headings**: Strong, clean sans-serif with commanding presence
- Hero title: Extra large, bold weight
- Section headings: Large, uppercase with increased letter-spacing for labels
- Card titles: Medium weight, clear hierarchy

**Body Text**: Highly readable, never too small
- Primary copy: Comfortable reading size with good line-height
- Secondary text: Softer treatment for supporting information
- Form labels: Clear, accessible sizing

## Layout System

**Spacing Units**: Tailwind spacing of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

**Section Structure** (in order):
1. **Hero**: Full-width, cinematic with dark overlay on gallery image placeholder, centered title/description, primary CTA, location/date subtext
2. **Vibe Section**: 2x2 grid (mobile: stack) with hover-interactive cards - "Candlelit gallery", "Data x Art", "No slides, no waffle", "Invite only crowd"
3. **Why Come**: Three-point layout, clean and readable, not wall of text
4. **Event Details**: Compact panel/card with visual markers for Location, Date, Format, Dress code
5. **Hosts**: Two-column (desktop) / stacked (mobile) with circular avatar placeholders
6. **Request Invitation**: Distinct form section with fields: Name, Email, Role, Company, two longer text areas
7. **Footer**: Minimal - series name, year, curator credit

**Containers**: Max-width of 6xl on desktop with centered alignment, full edge-to-edge on mobile with padding

## Color Palette

**Backgrounds**:
- Primary: slate-950, slate-900
- Overlays: black/90 for depth
- Gradients: Subtle warm dark gradients suggesting gallery lighting

**Accents** (warm gold/amber):
- Highlights: amber-300, amber-400
- CTA elements: amber-500
- Borders/rings: amber-400

**Text**:
- Primary: slate-100
- Secondary: slate-300
- Ensure high contrast for accessibility

## Component Library

**Buttons**:
- Primary CTA: Solid warm accent background, high contrast, rounded-full or rounded-xl
- Clear hover states: slightly brighter, subtle scale transform
- No blur backgrounds for these standalone buttons

**Cards** (Vibe section):
- Subtle hover effects: -translate-y-1, shadow-xl
- Smooth transitions on all interactive states
- Dark backgrounds with warm accent borders

**Form Elements**:
- Clean input styling with proper spacing
- Clear focus states
- Reassurance text beneath submit button

**Avatar Placeholders**: Circular with initials "AH" and "SB", clean dark background

## Images

**Hero Image**: Large gallery interior photograph from Marylebone - atmospheric, candlelit, moody. Full-width background with dark gradient overlay for text legibility.

**Additional Image Placeholders**: Abstract AI/data art imagery or gallery detail shots - use gradient backgrounds with overlay text as placeholders ("Gallery photo placeholder", "AI/data art placeholder")

**Image Treatment**: All images should have subtle dark overlays to maintain cohesive dark aesthetic and ensure text readability

## Responsive Behavior

**Mobile-First Approach**:
- Stack all columns vertically
- Generous padding (6-8 units)
- Full-width CTAs
- Readable text sizes

**Desktop Enhancements**:
- Grid layouts for vibe cards and hosts
- Side-by-side content where appropriate
- Increased spacing (12-24 units)
- Max-width containers for optimal reading

## Interaction Design

**Hover States**: Smooth transitions (all) on cards with lift effect and shadow enhancement

**Visual Hierarchy**: Clear separation between sections using spacing and subtle background variations

**Focal Points**: Hero CTA and invitation form CTA are primary conversion points - make them unmissable

## Accessibility

- Maintain high color contrast ratios (light text on dark backgrounds)
- No critical information conveyed by color alone
- Clear button and link identification
- Readable font sizes across all devices