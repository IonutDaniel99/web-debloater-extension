# Quality Checklist

Use this checklist to validate UI components before considering them complete.

## Visual Design

- [ ] **Typography hierarchy** — At least 3 distinct font sizes used purposefully
- [ ] **Font weights varied** — Not everything is font-normal; use 500, 600, 700 for emphasis
- [ ] **Spacing is intentional** — Consistent scale (4px base) but varied by context
- [ ] **Colors have purpose** — No decorative colors; each serves a semantic function
- [ ] **Borders are refined** — Using appropriate zinc/slate shades for both light/dark modes
- [ ] **Shadows are subtle** — No heavy drop shadows; prefer soft shadow-sm or shadow-md

## Interaction Design

- [ ] **All clickable elements have hover states** — Color change, scale, or underline
- [ ] **Focus states for accessibility** — Visible focus rings on interactive elements
- [ ] **Transitions are smooth** — 200-300ms transitions on specific properties
- [ ] **Loading states exist** — Skeleton screens, spinners, or disabled states
- [ ] **Empty states handled** — Meaningful messaging when no data exists
- [ ] **Error states defined** — Clear visual feedback for errors or validation

## Layout & Composition

- [ ] **Layout is not default-centered** — Uses creative grid, asymmetry, or full-width sections
- [ ] **Visual weight is balanced** — Mix of dense and sparse areas; negative space utilized
- [ ] **Responsive breakpoints tested** — Works smoothly at sm, md, lg, xl
- [ ] **Mobile-first approach** — Base styles for mobile, enhanced with breakpoints
- [ ] **Elements can overlap/layer** — Cards, badges, images compose together
- [ ] **Grid variety** — Not all sections use the same column count

## Dark Mode

- [ ] **Intentionally designed dark palette** — Not auto-inverted from light mode
- [ ] **Background hierarchy** — Page (zinc-900), cards (zinc-800), elevated (zinc-700)
- [ ] **Text contrast appropriate** — zinc-100 or zinc-200 for main text, not pure white
- [ ] **Borders visible in dark** — Using zinc-700 or zinc-600, not invisible
- [ ] **Colors desaturated** — Bright colors are slightly muted for eye comfort
- [ ] **Shadows still work** — May need to use borders or lighter backgrounds instead

## Code Quality

- [ ] **Semantic HTML** — article, section, nav, header over generic divs
- [ ] **TypeScript types defined** — Props interfaces with clear types
- [ ] **Accessibility attributes** — ARIA labels where needed, proper heading hierarchy
- [ ] **Tailwind classes organized** — Base → layout → colors → states → responsive
- [ ] **cn() utility used** — Conditional classes properly merged
- [ ] **Component is composable** — Can be used in different contexts

## Performance

- [ ] **Images optimized** — Using next/image or proper lazy loading
- [ ] **Animations use transform/opacity** — Avoid animating layout properties
- [ ] **No layout shift** — Loading states prevent CLS
- [ ] **Icon bundle optimized** — Only importing needed icons

## Distinctive Quality

- [ ] **Avoids centered card syndrome** — Layout is creative and purposeful
- [ ] **No generic gradients** — If gradients used, they're brand-specific and subtle
- [ ] **Has a unique quality** — Something memorable about the design
- [ ] **Feels polished** — Attention to detail in spacing, alignment, colors
- [ ] **Appropriate for context** — Matches the app's overall design language
