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

### Wheel Segment Alternating Palette
To ensure adjacent segments always have distinct contrast (even when `N` is odd), the wheel cycles through a curated 4-shade purple spectrum:
1. **Deep Indigo Violet**: `#1E1438`
2. **Royal AWS Purple**: `#4C1D95`
3. **Vibrant Amethyst**: `#6D28D9`
4. **Midnight Plum**: `#2E1065`
*(When the segment count `N % 4 === 1`, the final slice automatically selects shade `#3B177E` so slice `N-1` and slice `0` never share the same background color.)*

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

- **Ambient Lighting**: Two soft radial gradients (`rgba(139, 92, 246, 0.14)` and `rgba(168, 85, 247, 0.10)`) positioned behind the wheel hub and top header to create depth on dark projectors without washing out contrast.
- **Wheel Outer Ring**: Dual metallic-violet bezel with 24 subtle perimeter LED indicator dots that pulse softly during rotation.
- **Fixed Pointer**: Positioned at the right-hand 3 o'clock (`0 rad`) or top 12 o'clock (`-π/2 rad`) anchor — we standardize on a prominent **top-center (12 o'clock) ruby-violet jewelled pointer** with a drop shadow and subtle deflection bounce when slice pegs pass beneath it.
