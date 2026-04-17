# 🎨 BidVault Color System Guide

## Overview

BidVault now uses a professional, accessible color system that improves readability, hierarchy, and user experience. All colors are defined as CSS variables and should be used consistently across the application.

---

## 🧱 Base Colors (Neutrals)

These form the foundation of the design:

```css
--bg:           #0B0F14  /* Background Primary */
--surface:      #111827  /* Cards & Secondary Backgrounds */
--surface-2:    #1F2937  /* Hover & tertiary surfaces */
--surface-3:    #1F2937  /* Deep surfaces */
--surface-hover:#1F2937  /* Surface on hover */
```

### Text Colors
```css
--text:              #F9FAFB  /* Primary text */
--text-2:            #F9FAFB  /* Secondary text (same as primary) */
--text-secondary:    #9CA3AF  /* Muted secondary text */
--text-disabled:     #6B7280  /* Disabled state text */
--muted:             #9CA3AF  /* Muted/helper text */
```

### Borders
```css
--border:        #1F2937  /* Subtle borders */
--border-strong: #374151  /* Strong/active borders */
```

---

## 🟢 Primary Color (Main Actions)

**Use ONLY for:**
- Primary action buttons ("Bid Now", "View Catalog")
- Active/selected states (category tabs, filters)
- "LIVE" indicators and badges
- Current highest bid highlights
- Input focus states

```css
--primary:       #84CC16  /* Main action color */
--primary-hover: #65A30D  /* Hover state */
--primary-active:#4D7C0F  /* Active/pressed state */
--primary-soft:  rgba(132, 204, 22, 0.1)  /* Soft background */
```

### Usage Examples

**Button:**
```jsx
<button className="btn-primary">Place Bid</button>
```

**Badge:**
```jsx
<span className="badge badge-active">Live</span>
```

**Text:**
```jsx
<span className="text-primary">$1,250.00</span>
```

---

## 🔵 Secondary Color

Use for links, secondary actions, and focus indicators:

```css
--secondary: #3B82F6
```

---

## ⚠️ Semantic Colors

Colors that communicate system state and meaning:

### Success (Green)
```css
--success: #22C55E
```
Use for: Confirmations, "you are winning", successful actions

```jsx
<span className="text-success">You're the highest bidder!</span>
<div className="msg-success">Item added to favorites</div>
```

### Danger (Red)
```css
--danger: #EF4444
```
Use for: Errors, invalid bids, timer < 1 minute, destructive actions

```jsx
<span className="text-danger">Bid is below minimum</span>
<button className="btn-danger">Delete</button>
<div className="msg-error">Transaction failed</div>
```

### Warning (Orange)
```css
--warning: #F59E0B
```
Use for: Urgency alerts, ending soon (< 5 minutes)

```jsx
<span className="text-warning">Ending in 3 minutes</span>
```

---

## ⏳ Timer Logic (Dynamic Coloring)

Timers should change color based on urgency:

### Timer States

**Normal (> 5 minutes):**
```jsx
<span className="timer-normal">5h 30m remaining</span>
```
Color: `--text-secondary` (#9CA3AF)

**Warning (< 5 minutes):**
```jsx
<span className="timer-warning">4m 15s remaining</span>
```
Color: `--warning` (#F59E0B) with pulse animation

**Danger (< 1 minute):**
```jsx
<span className="timer-danger">45s remaining</span>
```
Color: `--danger` (#EF4444) with rapid pulse animation

### Implementation Example
```jsx
function Timer({ endTime }) {
  const timeRemaining = calculateTimeRemaining(endTime);
  
  if (timeRemaining > 300) {
    return <span className="timer-normal">{formatTime(timeRemaining)}</span>;
  } else if (timeRemaining > 60) {
    return <span className="timer-warning">{formatTime(timeRemaining)}</span>;
  } else {
    return <span className="timer-danger">{formatTime(timeRemaining)}</span>;
  }
}
```

---

## 🔘 Buttons

### Primary Button
Used for main actions like "Bid Now", "View Catalog", "Confirm"

```jsx
<button className="btn-primary">Place Bid</button>
```

**States:**
- Default: `#84CC16`
- Hover: `#65A30D` (darker)
- Active: `#4D7C0F` (even darker)
- Disabled: 40% opacity

### Secondary Button (Ghost)
Used for secondary/cancel actions

```jsx
<button className="btn-ghost">Cancel</button>
```

**States:**
- Border: `--border-strong` (#374151)
- Hover: Background `--surface-hover`, Border `--text`

### Danger Button
Used for destructive actions

```jsx
<button className="btn-danger">Delete Account</button>
```

---

## 🧭 Navigation & Icons

### Icon States

**Default (Inactive):**
```jsx
<icon className="icon-default">⭐</icon>
```
Color: `--muted` (#9CA3AF)

**Hover:**
Color: `--text` (#F9FAFB)

**Active/Selected:**
```jsx
<icon className="icon-active">⭐</icon>
```
Color: `--primary` (#84CC16)

---

## 🟩 Badges

Use soft background with solid color text for better hierarchy.

```jsx
<span className="badge badge-active">LIVE</span>
<span className="badge badge-pending">PENDING</span>
<span className="badge badge-closed">CLOSED</span>
<span className="badge badge-scheduled">SCHEDULED</span>
```

### Badge Colors

| Badge | Background | Text Color | Use Case |
|-------|-----------|-----------|----------|
| `badge-active` | rgba(34, 197, 94, 0.1) | `--success` | Live auctions, active status |
| `badge-pending` | rgba(132, 204, 22, 0.1) | `--primary` | Pending status |
| `badge-closed` | rgba(156, 163, 175, 0.1) | `--muted` | Closed auctions |
| `badge-scheduled` | rgba(59, 130, 246, 0.1) | `--secondary` | Upcoming auctions |

---

## 📝 Form Inputs

```jsx
<input className="input" placeholder="Enter amount" />
```

**States:**
- Border: `--border` (#1F2937)
- Placeholder: `--text-disabled` (#6B7280)
- Focus: Border becomes `--primary` (#84CC16)

---

## 🎯 Messages & Feedback

### Success Message
```jsx
<div className="msg-success">
  ✓ Bid placed successfully!
</div>
```

### Error Message
```jsx
<div className="msg-error">
  ✗ Bid is below the minimum amount
</div>
```

---

## 🚫 Important Rules

**DO:**
- ✅ Use CSS variables for all colors
- ✅ Use `--primary` for main actions only
- ✅ Use semantic colors (`--danger`, `--warning`, `--success`) for states
- ✅ Use `--muted` for helper text
- ✅ Maintain strong contrast (WCAG AA minimum)

**DON'T:**
- ❌ Use pure black (#000000)
- ❌ Use hardcoded color values (always use variables)
- ❌ Use too many bright colors in one view
- ❌ Use primary color decoratively
- ❌ Use semantic colors for non-semantic purposes

---

## 🎨 Color Usage Quick Reference

| Element | Color | CSS Class / Variable |
|---------|-------|---------------------|
| Primary button | `#84CC16` | `.btn-primary` |
| Secondary button | `--text` + border | `.btn-ghost` |
| Danger button | `#EF4444` | `.btn-danger` |
| Active category | `#84CC16` | `.text-primary` / `.icon-active` |
| Winning bid highlight | `#84CC16` | `.text-primary` |
| Timer (normal) | `#9CA3AF` | `.timer-normal` |
| Timer (warning) | `#F59E0B` | `.timer-warning` |
| Timer (danger) | `#EF4444` | `.timer-danger` |
| Error message | `#EF4444` | `.msg-error` |
| Success message | `#22C55E` | `.msg-success` |
| Card background | `#111827` | `.card` / `--surface` |
| Hover state | `#1F2937` | `--surface-hover` |
| Borders | `#1F2937` | `--border` |
| Strong borders | `#374151` | `--border-strong` |

---

## 📱 Accessibility

All colors meet WCAG AA contrast requirements:
- Text on backgrounds: 4.5:1 minimum
- Large text: 3:1 minimum
- Components with borders: Clear visual separation

Timer animations and color changes ensure users aren't relying solely on color to understand urgency.

---

## 🔄 Migration Checklist

When updating existing components:

- [ ] Replace `var(--lime)` with `var(--primary)` for main actions
- [ ] Replace inline color values with CSS variables
- [ ] Update timer display logic to use `.timer-normal/warning/danger` classes
- [ ] Update badge classes to use new semantic colors
- [ ] Replace custom button styles with `.btn-primary`, `.btn-ghost`, `.btn-danger`
- [ ] Review all hard-coded colors and convert to variables
- [ ] Test contrast ratios with WCAG tools
- [ ] Test animations on slower devices

---

## 🎬 Examples

### Complete Auction Card
```jsx
<div className="card">
  <div style={{ fontSize: "0.9rem" }}>
    <div className="text-primary">$1,250.00</div>
    <span className="badge badge-active">LIVE</span>
  </div>
  <div className="timer-warning">4m 30s remaining</div>
  <button className="btn-primary">Place Bid</button>
</div>
```

### Navigation Item
```jsx
<button 
  style={{ color: isActive ? "var(--primary)" : "var(--muted)" }}
  className={isActive ? "icon-active" : "icon-default"}
>
  Categories
</button>
```

### Status Indicator
```jsx
{isWinning ? (
  <span className="text-success">You're winning!</span>
) : bidTooLow ? (
  <span className="text-danger">Bid below minimum</span>
) : (
  <span className="text-muted">Place a bid</span>
)}
```

---

## 📞 Support

For questions about the color system or implementation, refer back to this guide or check `src/index.css` for the complete variable definitions.
