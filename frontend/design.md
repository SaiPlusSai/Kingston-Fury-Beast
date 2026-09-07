# Halo - Design System & Context Document

This document serves as the absolute source of truth for the brand identity, UX/UI principles, and design tokens for **Halo** (formerly UrbanShield). Provide this context to any AI UI generator (like Stitch, v0, or Cursor) to ensure design consistency with our existing application aesthetic.

## 1. Brand Context & Mission
*   **Name:** Halo
*   **Mission:** To transform citizens into an active, verified network of guardians. Halo provides a real-time, community-verified mapping platform to report and resolve urban incidents.
*   **Brand Vibe:** Professional, Accessible, Trustworthy, "Light Corporate", and "Smart-City Nature". It should feel like a premium institutional dashboard that is friendly enough for everyday citizens.

## 2. Core UI Principles
1.  **Typography Over Graphics:** Rely on strict grid alignments, clean typography, and ample whitespace. Avoid overly complex 3D illustrations.
2.  **Light Nature Aesthetic:** The primary UI is light mode, utilizing warm creams, pure whites, and deep forest greens to convey safety, nature, and institutional trust.
3.  **Soft Elevation:** Use pure white cards on warm cream backgrounds with very soft, diffuse shadows (`shadow-sm` or `shadow-md`) to create depth without harsh lines.
4.  **Micro-interactions:** Elements should pulse subtly or fade in smoothly using `framer-motion`.

## 3. Design Tokens (Tailwind CSS)

### Typography
*   **Font Family:** `Inter`, `Geist`, or a modern clean sans-serif.
*   **Headers:** High contrast, deeply professional.
*   **Body:** High legibility, dark slate/gray for text.

### Color Palette (Light "Nature/Institutional" Theme Default)
*   **Backgrounds:**
    *   `bg-primary-bg`: Warm Cream / Off-white (e.g., `#F8F9F7` or `#FAF9F6`). Use this for the main canvas/page background.
    *   `bg-white`: Pure White (`#FFFFFF`). Use this exclusively for cards, modals, and elevated containers.
    *   `bg-sidebar`: Deep Forest Green (e.g., `#2C5E53` or similar dark teal/green). Used for sidebars and primary institutional solid blocks.
*   **Text & Typography:**
    *   `text-primary`: `#1F2937` (Gray 800 - Deep slate for main headings).
    *   `text-secondary`: `#4B5563` (Gray 600 - For body text and descriptions).
    *   `text-muted`: `#9CA3AF` (Gray 400 - For timestamps or subtle labels).
*   **Accents & Semantics:**
    *   `primary`: Deep Forest Green / Emerald (Matches the sidebar). Used for primary buttons and active states.
    *   `status-verified` / `success`: `#10B981` (Emerald Green - Used when the community validates a report).
    *   `status-pending` / `warning`: `#F59E0B` (Amber/Orange - Awaiting verification, and used for notification badges).
    *   `status-critical` / `danger`: `#EF4444` (Red - For severe emergencies).

### UI Elements
*   **Borders:** Extremely subtle, e.g., `border-gray-200` or `border-border-light`. Do not use harsh black borders.
*   **Radii:** `rounded-2xl` or `rounded-xl` for large cards (Bento grids), `rounded-lg` for buttons and smaller components.
*   **Shadows:** Soft and friendly. Example: `shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]`.

## 4. The Core UX Flow (To be reflected in UI)
The UI must clearly communicate the 3-step lifecycle of an incident:
1.  **Report (Citizen):** A user submits an incident (GPS + Photo). UI feels immediate and frictionless.
2.  **Validate (Community):** Nearby nodes (citizens) receive an alert and verify it to earn Trust Points.
3.  **Resolve (Authority):** The verified incident appears on the authority Kanban board. Units are dispatched.

## 5. Instructions for AI Generators
When generating components for the Halo Landing Page:
*   **DO NOT use a dark mode or obsidian aesthetic for the default view.** Strictly follow the Light Cream/White/Forest Green palette defined above.
*   Use `framer-motion` for all transitions and reveals.
*   Use `lucide-react` for minimalist iconography.
*   Cards should be pure white on a cream background. Buttons should use the forest green accent.
*   The overall feel should be "Institutional yet friendly and modern."
