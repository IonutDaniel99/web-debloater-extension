---
name: distinctive-ui
description: 'Build production-grade frontend interfaces with exceptional design quality using React and Tailwind CSS. Use when creating components, pages, or features that require visual polish, creative layouts, thoughtful micro-interactions, and dark mode excellence. Actively avoids generic AI aesthetics like centered cards and purple gradients.'
argument-hint: 'Component or page to build with distinctive design'
---

# Distinctive UI Development

Build frontend interfaces that stand out with thoughtful design, refined execution, and creative visual approaches while avoiding common generic patterns.

## When to Use

- Creating new React components or pages
- Redesigning existing UI to be more distinctive
- Building feature-rich interfaces with complex interactions
- Implementing brand-aligned designs
- Elevating basic functionality with exceptional UX

## Design Principles

### 1. Visual Polish
- **Typography hierarchy**: Use varied font weights (400, 500, 600, 700) and sizes to create clear information hierarchy
- **Spacing rhythm**: Establish consistent spacing scale (4px base) but vary it purposefully — not everything needs equal padding
- **Color intentionality**: Choose a semantic color palette with purpose; avoid decorative gradients
- **Subtle refinements**: Add 1px borders, soft shadows (not heavy drop shadows), and refined hover states

### 2. Micro-interactions
- **Smooth transitions**: Use `transition-all duration-200 ease-in-out` sparingly; prefer specific property transitions
- **Hover states**: Always provide visual feedback — subtle scale, color shift, or glow
- **Loading states**: Never leave users guessing; implement skeleton screens or thoughtful spinners
- **Animation purpose**: Every animation should communicate state or guide attention

### 3. Layout Creativity
- **Break the grid**: Use asymmetric layouts, sidebars with different widths, overlapping sections
- **Visual weight**: Balance dense and sparse areas; negative space is a design tool
- **Avoid centering syndrome**: Full-width sections, edge-to-edge imagery, varied content widths
- **Component composition**: Layer elements thoughtfully (cards over backgrounds, badges overlapping corners)

### 4. Dark Mode Excellence
- **Not just inverted colors**: Dark mode should have its own carefully chosen palette
- **Reduced contrast**: Use `zinc-800` or `slate-800` backgrounds instead of pure black; `zinc-200` text instead of pure white
- **Elevated surfaces**: Lighter grays for elevated elements (cards: `bg-zinc-800`, page: `bg-zinc-900`)
- **Color vibrancy**: Slightly desaturate bright colors in dark mode for eye comfort

## Procedure

### Step 1: Analyze Requirements
Before writing code, determine:
- **Purpose**: What problem does this UI solve?
- **Hierarchy**: What's the most important information?
- **User flow**: How will users interact with this?
- **Context**: Where does this live in the app?

### Step 2: Design Structure
```typescript
// Plan the component structure first
// Example: Feature card that breaks the mold

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats?: { label: string; value: string };
}

// NOT: centered card with icon, title, desc
// YES: asymmetric layout with visual hierarchy
```

### Step 3: Build with Intention

**Component Architecture:**
```tsx
// Use semantic HTML with Tailwind utilities
// Avoid div soup — use article, section, header, etc.

export function FeatureShowcase({ features }: { features: Feature[] }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <article
          key={feature.title}
          className={cn(
            // Base styles
            "relative group p-6 rounded-lg border",
            "bg-white dark:bg-zinc-800",
            "border-zinc-200 dark:border-zinc-700",
            // Micro-interaction
            "transition-all duration-200",
            "hover:border-zinc-300 dark:hover:border-zinc-600",
            "hover:shadow-lg hover:-translate-y-1",
            // Conditional styling for variety
            index === 0 && "lg:col-span-2"
          )}
        >
          {/* Implementation */}
        </article>
      ))}
    </section>
  );
}
```

**Visual Polish Checklist:**
- [ ] Consistent spacing using Tailwind scale (p-4, p-6, gap-4, etc.)
- [ ] Typography hierarchy (text-sm/base/lg/xl/2xl with varied weights)
- [ ] Border colors for both light and dark modes
- [ ] Hover states on interactive elements
- [ ] Proper semantic HTML elements
- [ ] Loading and empty states
- [ ] Mobile-first responsive design (sm:, md:, lg: prefixes)

**Micro-interactions Implementation:**
```tsx
// Specific property transitions (better performance)
className="transition-transform duration-200 hover:scale-105"

// Staggered animations
{items.map((item, i) => (
  <div
    key={item.id}
    style={{ animationDelay: `${i * 100}ms` }}
    className="animate-in fade-in slide-in-from-left-4"
  >
    {/* content */}
  </div>
))}

// Interactive state feedback
const [isActive, setIsActive] = useState(false);
className={cn(
  "cursor-pointer",
  isActive && "ring-2 ring-blue-500 ring-offset-2"
)}
```

### Step 4: Refine Dark Mode

```tsx
// Use Tailwind's dark: variant consistently
className={cn(
  // Light mode
  "bg-white text-zinc-900 border-zinc-200",
  // Dark mode (not just inverted!)
  "dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700",
  // Hover states for both modes
  "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
)}

// For elevated surfaces
<div className="bg-zinc-50 dark:bg-zinc-900"> {/* Page background */}
  <div className="bg-white dark:bg-zinc-800"> {/* Card/elevated surface */}
    {/* content */}
  </div>
</div>
```

### Step 5: Test & Validate

Run through the [quality checklist](./references/quality-checklist.md):
- Visual hierarchy is clear
- All interactive elements have hover/focus states
- Dark mode is intentionally designed (not auto-inverted)
- Layout uses creative structure (not default centering)
- Animations are purposeful and performant
- Responsive breakpoints work smoothly
- Semantic HTML is used appropriately

## Anti-patterns to Avoid

### ❌ Centered Card Syndrome
```tsx
// Generic AI pattern
<div className="flex items-center justify-center min-h-screen">
  <div className="max-w-md mx-auto text-center p-8 rounded-xl border">
    {/* Everything centered in a card */}
  </div>
</div>
```

### ✅ Distinctive Alternative
```tsx
// Creative layout
<div className="min-h-screen grid lg:grid-cols-[2fr_3fr] gap-8 p-8">
  <aside className="space-y-6">
    {/* Sidebar content */}
  </aside>
  <main className="space-y-8">
    {/* Main content with varied widths */}
    <section className="max-w-2xl">...</section>
    <section className="max-w-4xl">...</section>
  </main>
</div>
```

### ❌ Generic Gradients
```tsx
// Overused pattern
<div className="bg-gradient-to-r from-purple-500 to-blue-500" />
```

### ✅ Subtle Sophistication
```tsx
// Refined approach
<div className={cn(
  "bg-white dark:bg-zinc-800",
  "border-l-4 border-blue-500", // Accent instead of gradient
  "shadow-sm shadow-blue-500/10" // Subtle colored shadow
)} />
```

## Examples

See [example components](./references/examples.md) for production-ready patterns that embody these principles.

For more complex patterns like multi-step forms, advanced filters, and notification systems, see [advanced patterns](./references/advanced-patterns.md).

## Brand Colors

This project uses a distinctive color system defined in `src/webpage/index.css`:

- **Primary**: Pink-red accent (`hsl(346.8, 77.2%, 49.8%)`) — use for CTAs, active states, and brand moments
- **Semantic colors**: Available via CSS variables (`bg-primary`, `text-destructive`, etc.)

When building components, prefer semantic color variables over direct Tailwind colors:
```tsx
// ✅ Good: Uses semantic variables
className="bg-primary text-primary-foreground hover:bg-primary/90"

// ✅ Good: Uses neutral scale for non-branded elements
className="bg-card text-card-foreground border-border"

// ❌ Avoid: Hardcoded colors that don't match brand
className="bg-blue-500 text-white"
```

For non-branded UI elements (borders, backgrounds, text), use:
- **Backgrounds**: `bg-background`, `bg-card`, `bg-popover`
- **Text**: `text-foreground`, `text-muted-foreground`
- **Borders**: `border-border`
- **Accents**: `bg-accent`, `text-accent-foreground`

## Tech Stack Assumptions

This skill assumes:
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with `cn()` utility (shadcn/ui pattern)
- **Icons**: Lucide React icons
- **Theme**: Light/dark mode via CSS variables and `class="dark"` on root element

## Output Format

When generating UI code:
1. Provide complete, runnable component code
2. Include all necessary imports
3. Show both light and dark mode considerations
4. Add inline comments explaining design decisions
5. Suggest 2-3 variations or enhancements
