# 03 — Design System & Visual Identity
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Visual Philosophy

The aesthetic is **AWS Cloud Club Midnight Violet** — engineered for both close-up mobile inspection and high-lumen auditorium projection. It combines deep obsidian-violet surfaces with crisp lavender typography, subtle radial spotlights, and precision geometric borders.

---

## 2. Color Palette

| Token Name | Hex Code | RGB / Alpha | Usage |
|---|---|---|---|
| `--bg-primary` | `#090714` | `rgb(9, 7, 20)` | Primary viewport canvas background |
| `--bg-secondary` | `#151027` | `rgb(21, 16, 39)` | Elevated sections, header bar, modal backdrop surface |
| `--bg-card` | `#1B1530` | `rgb(27, 21, 48)` | Glassmorphic cards, sidebar panels, control drawers |
| `--purple-primary` | `#8B5CF6` | `rgb(139, 92, 246)` | Primary interactive buttons, active indicators, wheel slices |
| `--violet-accent` | `#A855F7` | `rgb(168, 85, 247)` | Gradient highlights, pointer glow, badge accents |
| `--lavender-highlight` | `#C4B5FD` | `rgb(196, 181, 253)` | Eyebrow labels, subtle borders, active ring highlights |
| `--text-primary` | `#FFFFFF` | `rgb(255, 255, 255)` | Main headings, wheel labels, winner name |
| `--text-secondary` | `#A9A3BE` | `rgb(169, 163, 190)` | Supporting copy, metadata, timestamps |
| `--border-subtle` | `rgba(196, 181, 253, 0.16)` | Translucent Violet | Card borders, dividers, pill outlines |
| `--status-emerald` | `#10B981` | `rgb(16, 185, 129)` | Live sync status indicator |
| `--status-amber` | `#F59E0B` | `rgb(245, 158, 11)` | Stale cache / fallback warning |
| `--status-rose` | `#F43F5E` | `rgb(244, 63, 94)` | Destructive reset confirmation / connection error |

### Wheel Segment Multi-Color High-Contrast Palette (UI Overhaul v2)
Following organizer visual review on projector screens, the wheel was upgraded from a monochrome purple cycle to a bold, projector-safe 10-color spectrum with per-slice radial depth gradients and crisp white outlined labels:
1. **Violet**: `#7C3AED` (highlight `#A78BFA`)
2. **Pink**: `#DB2777` (highlight `#F9A8D4`)
3. **Amber**: `#D97706` (highlight `#FCD34D`)
4. **Emerald**: `#059669` (highlight `#6EE7B7`)
5. **Blue**: `#2563EB` (highlight `#93C5FD`)
6. **Red**: `#DC2626` (highlight `#FCA5A5`)
7. **Royal Purple**: `#7E22CE` (highlight `#D8B4FE`)
8. **Cyan**: `#0891B2` (highlight `#67E8F9`)
9. **Orange**: `#EA580C` (highlight `#FDBA74`)
10. **Indigo**: `#4F46E5` (highlight `#A5B4FC`)

---

## 3. Typography Hierarchy

- **Font Stack**: `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace Stack** (counts, timestamps, spin sequence numbers): `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace`

| Element | Desktop / Projector Size | Mobile Size | Weight & Tracking |
|---|---|---|---|
| **Hero Heading** (`Let the Wheel Decide!`) | `3.25rem` (52px) | `2rem` (32px) | `800` (ExtraBold), `-0.03em` |
| **Winner Modal Name** | `3.5rem` (56px) | `2.25rem` (36px) | `800` (ExtraBold), `-0.02em` |
| **Header Brand Title** | `1.25rem` (20px) | `1rem` (16px) | `700` (Bold), `-0.01em` |
| **Header University Subtitle** | `0.875rem` (14px) | `0.75rem` (12px) | `500` (Medium), `+0.02em` |
| **Primary Spin CTA Button** | `1.25rem` (20px) | `1.125rem` (18px) | `800` (ExtraBold), `+0.08em` uppercase |
| **Wheel Slice Student Name** | Dynamic (`11px`–`18px`) | Dynamic (`10px`–`15px`) | `600` (SemiBold) |

---

## 4. Brand Asset Usage Guidelines

- **Official Asset**: `https://builder.aws.com/assets/Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg`
- **Native Dimensions**: `1200 × 675` (`16:9` aspect ratio).
- **Rules**:
  1. Never stretch, skew, or crop the SVG into a non-16:9 container.
  2. Display the banner inside an `aspect-[16/9]` container with `object-contain` and matching `#161D26` container fill.
  3. Never fabricate or alter official AWS "smile" logos.
  4. Provide resilient fallback rendering if the external image URL is blocked by a firewall.

---

## 5. Layout, Elevation & Microinteractions

- **Ambient Lighting**: Deep obsidian-violet backdrop (`#060412` → `#150D2E`) layered with crown/side ambient spotlights, subtle dot-grid texture, and a live HTML5 Canvas background rendering drifting translucent color orbs and twinkling stars (respects `prefers-reduced-motion`).
- **Wheel Outer Ring**: Conic metallic multi-color bezel with 36 perimeter LED indicator dots that chase softly when idle, accelerate during spins, and sparkle upon winner reveal, backed by a rotating rainbow halo glow.
- **Fixed Pointer**: Prominent **top-center (12 o'clock) fuchsia-violet jewelled pointer** with outer glow and spring deflection bounce as each slice peg passes beneath it.
