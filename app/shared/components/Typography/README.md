# Typography Components

Type-safe, accessible typography components based on the Figma design system.

## Components

### Title

Display titles using Crimson Pro font family.

**Variants:** `h0`, `h1`, `h2`, `h3`

```tsx
import { Title } from "~/shared/components/Typography";

// Default usage
<Title variant="h1">Welcome to the App</Title>

// With custom className
<Title variant="h2" className="text-blue-600">Section Title</Title>

// Override semantic tag
<Title variant="h1" as="div">Non-semantic heading</Title>
```

**Font Specs:**
- **H0**: 44px, Regular (400), Crimson Pro
- **H1**: 36px, Regular (400), Crimson Pro
- **H2**: 24px, Regular (400), Crimson Pro
- **H3**: 20px, Regular (400), Crimson Pro

### Body

Body text using Inter font family.

**Variants:** `1`, `2`

```tsx
import { Body } from "~/shared/components/Typography";

// Default usage (renders as <p>)
<Body variant="1">This is body text using Body-1 style.</Body>

// Smaller body text
<Body variant="2">This is smaller body text using Body-2 style.</Body>

// Override tag
<Body variant="1" as="span">Inline body text</Body>
```

**Font Specs:**
- **Body-1**: 16px, Regular (400), Inter
- **Body-2**: 14px, Regular (400), Inter

### Caption

Small text and labels using Inter font family.

**Variants:** `1`, `2`

```tsx
import { Caption } from "~/shared/components/Typography";

// Caption-1: Uppercase, semi-bold, wide letter spacing
<Caption variant="1">Featured Item</Caption>

// Caption-2: Medium weight
<Caption variant="2">Posted 2 hours ago</Caption>

// Override tag
<Caption variant="1" as="label" htmlFor="email">Email Address</Caption>
```

**Font Specs:**
- **Caption-1**: 10px, Semi Bold (600), Inter, 2px letter-spacing, UPPERCASE
- **Caption-2**: 12px, Medium (500), Inter

## Props

All components share the same base props:

```typescript
interface BaseTypographyProps {
  children: React.ReactNode;
  className?: string;  // Additional Tailwind classes
  as?: React.ElementType;  // Override the HTML tag
}
```

### Title Props
```typescript
interface TitleProps extends BaseTypographyProps {
  variant: "h0" | "h1" | "h2" | "h3";
}
```

### Body Props
```typescript
interface BodyProps extends BaseTypographyProps {
  variant: "1" | "2";
}
```

### Caption Props
```typescript
interface CaptionProps extends BaseTypographyProps {
  variant: "1" | "2";
}
```

## Default HTML Tags

Each variant renders a semantic HTML tag by default:

| Component | Variant | Default Tag |
|-----------|---------|-------------|
| Title     | h0      | `<h1>`      |
| Title     | h1      | `<h1>`      |
| Title     | h2      | `<h2>`      |
| Title     | h3      | `<h3>`      |
| Body      | 1, 2    | `<p>`       |
| Caption   | 1, 2    | `<span>`    |

Override using the `as` prop when needed.

## Mobile-First Approach

All typography components are optimized for mobile-first design. Add responsive classes as needed:

```tsx
<Title
  variant="h1"
  className="text-center md:text-left"
>
  Responsive Title
</Title>

<Body
  variant="1"
  className="text-sm md:text-base lg:text-lg"
>
  This text will scale up on larger screens
</Body>
```

## Accessibility

- Uses semantic HTML by default (`h1`, `h2`, `h3`, `p`, `span`)
- Override with `as` prop when semantic tag isn't appropriate
- Ensure proper heading hierarchy (don't skip levels)
- Add ARIA labels when needed via className or wrapper elements

## Examples

### Complete Page Example

```tsx
import { Title, Body, Caption } from "~/shared/components/Typography";

export default function ProductPage() {
  return (
    <main className="p-4">
      <Caption variant="1" className="text-gray-500 mb-2">
        New Release
      </Caption>

      <Title variant="h1" className="mb-4">
        Product Name
      </Title>

      <Body variant="1" className="mb-6">
        This is the main product description using Body-1 style.
        It provides key information about the product.
      </Body>

      <Title variant="h2" className="mb-3">
        Features
      </Title>

      <Body variant="2" className="text-gray-600">
        Additional details in a smaller font size.
      </Body>

      <Caption variant="2" className="mt-4 text-gray-400">
        Last updated: January 2025
      </Caption>
    </main>
  );
}
```

## Font Loading

Fonts are loaded via Google Fonts in `app/root.tsx`:
- **Crimson Pro**: Regular (400)
- **Inter**: Regular (400), Medium (500), Semi Bold (600)

## TailwindCSS Configuration

Typography tokens are configured in `tailwind.config.ts`:

```typescript
fontFamily: {
  crimson: ['"Crimson Pro"', 'serif'],
  inter: ['Inter', 'sans-serif'],
},
fontSize: {
  'title-h0': ['44px', { lineHeight: '100%', fontWeight: '400' }],
  'title-h1': ['36px', { lineHeight: '100%', fontWeight: '400' }],
  // ... etc
}
```
