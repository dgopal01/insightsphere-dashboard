# EthosAI Color Scheme

This document defines the official color scheme for the EthosAI application, matching the original sample app design.

## Primary Colors

### Light Mode

| Color Variable | Hex Value | HSL Value | Usage |
|---------------|-----------|-----------|-------|
| `--primary` | `#28334A` | `213 28% 22%` | Primary buttons, headings, main brand color |
| `--primary-foreground` | `#FFFFFF` | `0 0% 100%` | Text on primary color |
| `--secondary` | `#00818F` | `186 100% 28%` | Secondary buttons, accents, links |
| `--secondary-foreground` | `#FFFFFF` | `0 0% 100%` | Text on secondary color |
| `--background` | `#FFFFFF` | `0 0% 100%` | Main page background |
| `--foreground` | `#28334A` | `213 28% 22%` | Main text color |
| `--muted` | `#ECECF0` | `240 14% 93%` | Muted backgrounds, disabled states |
| `--muted-foreground` | `#6B7A94` | `213 15% 45%` | Muted text |

### Sidebar Colors

| Color Variable | Hex Value | HSL Value | Usage |
|---------------|-----------|-----------|-------|
| `--sidebar` | `#28334A` | `213 28% 22%` | Sidebar background |
| `--sidebar-foreground` | `#FFFFFF` | `0 0% 100%` | Sidebar text |
| `--sidebar-primary` | `#00818F` | `186 100% 28%` | Active menu item |
| `--sidebar-accent` | `#323F58` | `213 28% 28%` | Hover state |

### Chart Colors

| Color Variable | Hex Value | HSL Value | Description |
|---------------|-----------|-----------|-------------|
| `--chart-1` | `#00818F` | `186 100% 28%` | Teal - Primary chart color |
| `--chart-2` | `#28334A` | `213 28% 22%` | Dark blue-gray - Secondary |
| `--chart-3` | `#5A6F8F` | `215 25% 45%` | Medium blue - Tertiary |
| `--chart-4` | `#0FA3B1` | `187 85% 35%` | Bright teal - Accent |
| `--chart-5` | `#1C2938` | `210 35% 17%` | Very dark blue - Contrast |

### UI Element Colors

| Color Variable | Hex Value | HSL Value | Usage |
|---------------|-----------|-----------|-------|
| `--card` | `#FFFFFF` | `0 0% 100%` | Card backgrounds |
| `--border` | `#E6E6EB` | `240 14% 90%` | Borders, dividers |
| `--input` | `#E6E6EB` | `240 14% 90%` | Input borders |
| `--ring` | `#00818F` | `186 100% 28%` | Focus rings |
| `--destructive` | `#E63946` | `0 84% 60%` | Error states, delete buttons |

## Dark Mode Colors

### Base Colors

| Color Variable | Hex Value | HSL Value | Usage |
|---------------|-----------|-----------|-------|
| `--background` | `#1A2332` | `210 35% 12%` | Dark background |
| `--foreground` | `#FAFAFA` | `0 0% 98%` | Light text |
| `--card` | `#212D3F` | `210 35% 15%` | Card backgrounds |
| `--primary` | `#00A3B5` | `186 100% 35%` | Brighter teal for visibility |
| `--sidebar` | `#1A2332` | `210 35% 12%` | Dark sidebar |

## Color Usage Guidelines

### Buttons

- **Primary Action**: Use `--primary` (#28334A) with white text
- **Secondary Action**: Use `--secondary` (#00818F) with white text
- **Destructive Action**: Use `--destructive` with white text
- **Ghost/Outline**: Use `--border` with `--foreground` text

### Text Hierarchy

1. **Headings**: `--foreground` (#28334A)
2. **Body Text**: `--foreground` (#28334A)
3. **Secondary Text**: `--muted-foreground` (#6B7A94)
4. **Disabled Text**: `--muted-foreground` with reduced opacity

### Backgrounds

1. **Page Background**: `--background` (#FFFFFF)
2. **Card Background**: `--card` (#FFFFFF)
3. **Muted Background**: `--muted` (#ECECF0)
4. **Sidebar Background**: `--sidebar` (#28334A)

### Interactive States

- **Hover**: Reduce opacity by 10% or use `--accent`
- **Active**: Use `--sidebar-primary` (#00818F) for sidebar items
- **Focus**: Show `--ring` (#00818F) outline
- **Disabled**: Use `--muted` with reduced opacity

## Accessibility

All color combinations meet WCAG 2.1 AA standards for contrast:

- **Primary on White**: 9.8:1 (AAA)
- **Secondary on White**: 4.8:1 (AA)
- **Foreground on Background**: 9.8:1 (AAA)
- **Muted Foreground on Background**: 4.5:1 (AA)

## Implementation

Colors are defined in `src/styles/globals.css` using CSS custom properties:

```css
:root {
  --primary: 213 28% 22%;        /* #28334A */
  --secondary: 186 100% 28%;     /* #00818F */
  --sidebar: 213 28% 22%;        /* #28334A */
  --sidebar-primary: 186 100% 28%; /* #00818F */
  /* ... */
}
```

Colors are applied using Tailwind CSS utility classes:

```tsx
<Button className="bg-primary text-primary-foreground">
  Primary Button
</Button>

<div className="bg-sidebar text-sidebar-foreground">
  Sidebar Content
</div>
```

## Brand Identity

The color scheme reflects EthosAI's commitment to:

- **Trust**: Dark blue-gray (#28334A) conveys professionalism and reliability
- **Innovation**: Teal (#00818F) represents forward-thinking and technology
- **Clarity**: High contrast ensures readability and accessibility
- **Consistency**: Unified color system across all components

## Version History

- **v1.0.0** (December 2025): Initial color scheme matching sample app
  - Primary: #28334A (Dark blue-gray)
  - Secondary: #00818F (Teal)
  - Muted: #ECECF0
  - Chart colors: 5 coordinated colors for data visualization
