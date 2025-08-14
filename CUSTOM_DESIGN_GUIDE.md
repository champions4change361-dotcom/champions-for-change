# Custom CSS and Tailwind Design Guide

This guide explains how to create custom CSS and Tailwind components in this athletics management platform.

## 🎨 Current Custom Design System

### 1. CSS Custom Properties (Variables)

Located in `client/src/index.css`, we define custom CSS variables for consistent theming:

```css
:root {
  /* Your custom variables */
  --custom-primary: hsl(220 100% 60%);
  --custom-secondary: hsl(15 100% 65%);
  --custom-gradient-start: hsl(280 100% 70%);
  --custom-gradient-end: hsl(200 100% 60%);
  --custom-border-radius: 1rem;
  --custom-shadow: 0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}
```

### 2. Custom Utility Classes

We've created reusable utility classes in `client/src/index.css`:

```css
/* Custom Button with Gradient */
.btn-custom {
  @apply px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105;
  background: linear-gradient(135deg, var(--custom-gradient-start), var(--custom-gradient-end));
  box-shadow: var(--custom-shadow);
}

/* Custom Card with Hover Effects */
.card-custom {
  @apply bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300;
  border-radius: var(--custom-border-radius);
  box-shadow: var(--custom-shadow);
}

/* Glass Morphism Effect */
.glass-morphism {
  @apply backdrop-blur-md bg-white/10 border border-white/20;
}

/* Gradient Text */
.text-gradient {
  background: linear-gradient(135deg, var(--custom-gradient-start), var(--custom-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 3. Tailwind Config Extensions

In `tailwind.config.ts`, we've extended Tailwind with:

#### Custom Colors
```typescript
colors: {
  "custom": {
    "primary": "var(--custom-primary)",
    "secondary": "var(--custom-secondary)",
    "gradient-start": "var(--custom-gradient-start)",
    "gradient-end": "var(--custom-gradient-end)",
  },
  "glass": {
    "50": "rgba(255, 255, 255, 0.05)",
    "100": "rgba(255, 255, 255, 0.1)",
    "200": "rgba(255, 255, 255, 0.2)",
  },
}
```

#### Custom Animations
```typescript
keyframes: {
  "float": {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-10px)" },
  },
  "pulse-glow": {
    "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
    "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
  },
}
```

#### Custom Spacing & Shadows
```typescript
spacing: {
  '18': '4.5rem',
  '88': '22rem',
  '128': '32rem',
},
boxShadow: {
  'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
  'glow-lg': '0 0 40px rgba(59, 130, 246, 0.6)',
}
```

## 🛠 Custom React Components

### 1. CustomCard Component
Location: `client/src/components/ui/custom-card.tsx`

Features:
- Multiple variants: `default`, `gradient`, `glass`
- Multiple sizes: `sm`, `md`, `lg`
- Built-in hover animations

```tsx
<CustomCard variant="glass" size="lg">
  Your content here
</CustomCard>
```

### 2. CustomButton Component
Location: `client/src/components/ui/custom-card.tsx`

Features:
- Multiple variants: `gradient`, `glow`, `glass`
- Loading states with spinner
- Hover animations and transitions

```tsx
<CustomButton variant="gradient" size="md" loading>
  Click me
</CustomButton>
```

### 3. AnimatedText Component
Location: `client/src/components/ui/animated-text.tsx`

Features:
- Text animations: `gradient`, `glow`, `typewriter`
- Customizable delays
- CSS-based animations

```tsx
<AnimatedText variant="gradient" delay={0.5}>
  Animated text here
</AnimatedText>
```

### 4. FloatingElement Component
Location: `client/src/components/ui/animated-text.tsx`

Features:
- Floating animation
- Customizable animation delay
- Perfect for icons and decorative elements

```tsx
<FloatingElement delay={1}>
  <div className="floating-icon">Content</div>
</FloatingElement>
```

## 🚀 How to Create Your Own Components

### Method 1: CSS Variables + Tailwind Classes

1. **Add CSS variables** in `client/src/index.css`:
```css
:root {
  --my-custom-color: hsl(210 100% 50%);
  --my-custom-radius: 0.75rem;
}
```

2. **Create utility classes**:
```css
@layer utilities {
  .my-custom-style {
    @apply p-4 rounded-lg transition-all;
    background-color: var(--my-custom-color);
    border-radius: var(--my-custom-radius);
  }
}
```

3. **Use in components**:
```tsx
<div className="my-custom-style hover:scale-105">
  Custom styled element
</div>
```

### Method 2: Extend Tailwind Config

1. **Add to `tailwind.config.ts`**:
```typescript
extend: {
  colors: {
    "my-brand": {
      "light": "#3b82f6",
      "dark": "#1e40af",
    }
  },
  animation: {
    "my-animation": "my-animation 2s ease-in-out infinite",
  },
  keyframes: {
    "my-animation": {
      "0%, 100%": { transform: "rotate(0deg)" },
      "50%": { transform: "rotate(180deg)" },
    },
  }
}
```

2. **Use directly in JSX**:
```tsx
<div className="bg-my-brand-light animate-my-animation">
  Content with custom Tailwind classes
</div>
```

### Method 3: React Component with Variants

1. **Create component** in `client/src/components/ui/`:
```tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  variant = 'primary', 
  size = 'sm', 
  className, 
  children 
}) => {
  return (
    <div
      className={cn(
        'base-styles transition-all',
        {
          'bg-blue-500 text-white': variant === 'primary',
          'bg-gray-500 text-black': variant === 'secondary',
          'p-2 text-sm': size === 'sm',
          'p-4 text-lg': size === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  );
};
```

## 🎯 Demo Page

Visit `/custom-design-demo` to see all custom components in action. This page demonstrates:

- Custom buttons with gradients and glow effects
- Glass morphism cards
- Animated text components
- Floating elements
- Custom spacing and layouts
- Loading states
- All variants and sizes

## 📋 Best Practices

1. **Use CSS Variables**: For colors that need to change between light/dark themes
2. **Layer Your CSS**: Use `@layer utilities` for custom utilities
3. **Consistent Naming**: Use semantic names like `--primary`, `--secondary`
4. **Responsive Design**: Always consider mobile-first design
5. **Performance**: Use CSS transforms for animations instead of changing layout properties
6. **Accessibility**: Ensure sufficient color contrast and provide focus states

## 🔗 Quick Access

- **Home Page**: Added "Design Demo" card in the Arena Command Center
- **Direct URL**: `/custom-design-demo`
- **Test ID**: `card-custom-design` for automation testing

## 🛡 Dark Mode Support

All custom components automatically support dark mode through CSS variables that change based on the `.dark` class:

```css
.dark {
  --custom-primary: hsl(220 100% 70%); /* Lighter for dark mode */
  --custom-secondary: hsl(15 100% 75%); /* Adjusted for contrast */
}
```

This ensures your custom designs work perfectly in both light and dark themes!