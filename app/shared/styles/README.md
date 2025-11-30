# Color System

Type-safe color tokens based on the Figma design system for the Kérastase project.

## Color Palette

### Primary

The primary brand color used for key actions and brand elements.

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#C9A961` | Primary actions, brand highlights, key CTAs |

**Example:**
```tsx
<button className="bg-primary text-neutral-white">
  Get Started
</button>
```

### Neutral Colors

Core neutral colors for text, backgrounds, and borders.

| Token | Value | Visual | Usage |
|-------|-------|--------|-------|
| `neutral-dark` | `#101828` | ⬛ | Primary text, dark backgrounds |
| `neutral-white` | `#FFFFFF` | ⬜ | Light backgrounds, text on dark |
| `neutral-gray` | `#6A7282` | ◼️ | Secondary text, subtle elements |
| `neutral-gray-200` | `#D9DBE1` | ◻️ | Borders, dividers, disabled states |

**Examples:**
```tsx
// Dark background with white text
<div className="bg-neutral-dark text-neutral-white p-4">
  <h1>Welcome</h1>
</div>

// Gray text for secondary information
<p className="text-neutral-gray">Posted 2 hours ago</p>

// Light gray border
<div className="border border-neutral-gray-200 rounded-lg">
  Content
</div>
```

### Surface Colors

Background colors for cards, panels, and sections.

| Token | Value | Usage |
|-------|-------|-------|
| `surface-light` | `#F9FAFB` | Card backgrounds, light sections, subtle surfaces |

**Example:**
```tsx
<div className="bg-surface-light rounded-lg p-6">
  <p>Card content on subtle background</p>
</div>
```

### Feedback Colors

Colors for user feedback, states, and alerts.

| Token | Value | Visual | Usage |
|-------|-------|--------|-------|
| `feedback-success` | `#0E9F6E` | 🟢 | Success messages, confirmation, positive states |
| `feedback-error` | `#E5484D` | 🔴 | Error messages, warnings, destructive actions |

**Examples:**
```tsx
// Success message
<div className="bg-feedback-success text-white p-4 rounded">
  Profile updated successfully!
</div>

// Error message
<div className="bg-feedback-error text-white p-4 rounded">
  Please check your email address
</div>

// Error text
<p className="text-feedback-error text-sm">
  This field is required
</p>
```

## Usage

### With Tailwind Classes

Use color tokens directly in Tailwind classes:

```tsx
// Background colors
<div className="bg-primary" />
<div className="bg-neutral-dark" />
<div className="bg-surface-light" />

// Text colors
<p className="text-primary" />
<p className="text-neutral-gray" />
<p className="text-feedback-error" />

// Border colors
<div className="border-primary" />
<div className="border-neutral-gray-200" />
```

### With JavaScript/TypeScript

For non-Tailwind usage (e.g., canvas, inline styles, CSS-in-JS):

```tsx
import { colors } from "~/shared/types/colors";

// Inline styles
<div style={{ backgroundColor: colors.primary }}>
  Content
</div>

// JavaScript logic
const primaryColor = colors.primary; // "#C9A961"
const successColor = colors.feedback.success; // "#0E9F6E"
```

## Mobile-First Approach

All colors work seamlessly with responsive design:

```tsx
<div className="
  bg-neutral-white
  md:bg-surface-light
  lg:bg-neutral-dark
  text-neutral-dark
  md:text-neutral-gray
  lg:text-neutral-white
">
  Responsive background and text colors
</div>
```

## Accessibility

### Contrast Ratios

These color combinations meet **WCAG AA** standards (4.5:1 for normal text, 3:1 for large text):

✅ **Recommended Combinations:**
- `text-neutral-dark` on `bg-neutral-white` (High contrast)
- `text-neutral-white` on `bg-neutral-dark` (High contrast)
- `text-neutral-white` on `bg-primary` (Sufficient contrast)
- `text-neutral-white` on `bg-feedback-success` (High contrast)
- `text-neutral-white` on `bg-feedback-error` (High contrast)

⚠️ **Use with Caution:**
- `text-neutral-gray` on `bg-neutral-white` (Lower contrast - use for secondary content only)
- `text-neutral-gray-200` on `bg-neutral-white` (Very low contrast - use for decorative elements only)

### Best Practices

1. **Text on Backgrounds:**
   - Always use high-contrast combinations for body text
   - Use `text-neutral-dark` on light backgrounds
   - Use `text-neutral-white` on dark backgrounds

2. **Interactive Elements:**
   - Ensure buttons have sufficient contrast
   - Add focus states with clear outlines
   - Use semantic colors (success/error) appropriately

3. **Decorative vs. Functional:**
   - Lower contrast is acceptable for decorative elements
   - Functional text must meet WCAG AA standards

## Color Naming Convention

Colors follow a semantic naming pattern:

```
[category]-[variant]-[shade?]

Examples:
- primary (no category needed for brand primary)
- neutral-dark
- neutral-gray-200
- surface-light
- feedback-success
```

This makes the purpose of each color clear at a glance.

## Design System Integration

These colors are extracted from the Figma design file and should remain in sync. Any color changes should:

1. Start in Figma
2. Be extracted and updated in `tailwind.config.ts`
3. Be updated in `app/shared/types/colors.ts`
4. Be documented here

## Complete Reference

```typescript
// TailwindCSS (tailwind.config.ts)
colors: {
  primary: "#C9A961",
  neutral: {
    dark: "#101828",
    white: "#FFFFFF",
    gray: "#6A7282",
    "gray-200": "#D9DBE1",
  },
  surface: {
    light: "#F9FAFB",
  },
  feedback: {
    success: "#0E9F6E",
    error: "#E5484D",
  },
}
```

## Examples

### Complete Component Example

```tsx
import { colors } from "~/shared/types/colors";

export default function ProfileCard() {
  return (
    <div className="
      bg-surface-light
      border border-neutral-gray-200
      rounded-lg
      p-6
      hover:border-primary
      transition-colors
    ">
      <div className="bg-primary text-neutral-white px-3 py-1 rounded-full inline-block text-sm mb-4">
        Premium Member
      </div>

      <h2 className="text-neutral-dark text-title-h2 mb-2">
        John Doe
      </h2>

      <p className="text-neutral-gray text-body-2 mb-4">
        Product Designer at Kérastase
      </p>

      <div className="flex gap-2">
        <button className="bg-primary text-neutral-white px-4 py-2 rounded-lg hover:opacity-90">
          Follow
        </button>
        <button className="bg-neutral-white text-neutral-dark border border-neutral-gray-200 px-4 py-2 rounded-lg hover:bg-surface-light">
          Message
        </button>
      </div>

      <div className="mt-4 bg-feedback-success text-neutral-white px-3 py-2 rounded text-sm">
        Profile verified successfully!
      </div>
    </div>
  );
}
```

### Form with Validation

```tsx
export default function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <form className="bg-neutral-white p-6 rounded-lg border border-neutral-gray-200">
      <h2 className="text-neutral-dark text-title-h2 mb-4">Sign Up</h2>

      <input
        type="email"
        className="
          w-full
          px-4 py-2
          border border-neutral-gray-200
          rounded
          text-neutral-dark
          focus:outline-none
          focus:border-primary
          focus:ring-2
          focus:ring-primary/20
        "
        placeholder="Enter your email"
      />

      {error && (
        <p className="text-feedback-error text-body-2 mt-2">
          {error}
        </p>
      )}

      {success && (
        <div className="bg-feedback-success text-neutral-white p-3 rounded mt-4">
          Account created successfully!
        </div>
      )}

      <button className="
        w-full
        bg-primary
        text-neutral-white
        px-4 py-3
        rounded
        mt-4
        hover:opacity-90
        transition-opacity
        disabled:opacity-50
        disabled:cursor-not-allowed
      ">
        Create Account
      </button>
    </form>
  );
}
```
