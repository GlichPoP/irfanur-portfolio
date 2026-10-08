# Irfanur Rahman — Personal Portfolio

[![Live Site](https://img.shields.io/badge/Live_Portfolio-Online-00c853?style=for-the-badge&logo=googlechrome&logoColor=white)](https://glichpop.github.io/irfanur-portfolio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Flagship: PROBAHO CRM](https://img.shields.io/badge/Flagship-PROBAHO_CRM_Solutions-D97757?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/GlichPoP/probaho-crm)

Personal portfolio website presenting the professional track record, corporate credentials, and software platforms of **Irfanur Rahman**.

Designed with 100% adherence to **Alice Lee's (`byalicelee.com`) warm editorial design system**, featuring serif typography, a warm linen palette, unfragmented sectional architecture, and resilient interactive capabilities.

Hosted for free on **GitHub Pages**.

---

## 🏛️ Authentic Sectional Architecture

The portfolio is structured into four primary, dedicated sections matching Irfanur's verified professional history:

### 1. Editorial Hero & Introduction (`#home`)
- **Greeting & Identity**: Editorial lockup ("Hi, I'm Irfanur!") presenting a product builder and systems specialist unifying corporate finance, supply chain management, and modern software tools.
- **Profile Portrait**: High-resolution authentic portrait (`assets/profile.jpg`) in a proportional 4:5 container with subtle elevation.
- **3-Pillar Domain Summary**:
  1. **Corporate Finance**: Oracle ERP General Ledger, Bank & Trial Balance Reconciliations, Financial Modeling in Advanced Excel.
  2. **Supply Chain Management**: Cross-Border Multi-Warehouse Inventory Synchronization, 64-District Courier Logistics, Working Capital Preservation.
  3. **Modern Software Tools**: Offline-First Desktop Platforms built with Electron 43, React 19, and SQLite WebAssembly.

### 2. Software Projects (`#software`)
- **PROBAHO CRM Solutions (`com.irfanurrahman.probahocrm`)**: Consolidated flagship showcase presented as a wide 21:8 desktop card (auto on mobile) with logo, verified version `v1.0.0` production badges, and deep architectural narrative.
- **Core Technology Stack**:
  - **Desktop Runtime**: Electron 43 with process sandboxing and context isolation.
  - **Frontend Architecture**: React 19, TypeScript, and Vite 8.
  - **Relational Database**: Embedded in-process SQLite 3 WebAssembly via `sql.js` delivering `< 1ms` local query latency and 100% checkout uptime during broadband outages.
  - **Nationwide Logistics**: Native dispatch profiles for all 64 districts of Bangladesh (Pathao, Steadfast, RedX, Paperfly, Sundarban, eCourier) with automated Cash-on-Delivery (COD) remittance reconciliation.
  - **Background Auto-Updater**: In-app release streaming via GitHub Releases CDN with real-time download percentage and 1-click silent relaunch.
  - **Distribution**: Windows Installer (`.exe` via NSIS) and Portable standalone executable.
- **Interactive Deep Dive**: Case study modal trigger (`data-modal="modal-probaho"`) detailing operational problem, architecture, metrics, and repository links.

### 3. Corporate Experience (`#experience`)
- **Square Toiletries Ltd** (*Accounts & Finance Intern*, Feb 2026 – May 2026):
  - Managed daily Oracle ERP General Ledger distributions, transaction vouchers, and invoice posting for one of Bangladesh's premier FMCG conglomerates.
  - Executed automated bank and trial balance reconciliations, detecting discrepancies and verifying multi-account ledger integrity.
  - Built financial models, depreciation schedules, and variance analysis sheets in Advanced Excel.
- **Strides Co Ltd / Strides Co USA** (*E-Commerce Executive & Logistics Lead*, Feb 2025 – Sep 2025):
  - Configured and launched the direct-to-consumer North American digital storefront on Shopify USA, including currency gateways and checkout flows.
  - Engineered cross-border multi-warehouse inventory synchronization and safety stock buffers between Bangladesh manufacturing and USA fulfillment hubs to eliminate stockout latency.
  - Executed organic SEO, product catalog taxonomy optimization, and Canva acquisition creatives.

### 4. Academic Foundation (`#academics`)
- **BRAC University — BRAC Business School (BBS)** (*Bachelor of Business Administration — BBA*, 2022 – 2026):
  - **Major in Finance**: Corporate financial modeling, working capital management, corporate valuation, investment appraisal.
  - **Minor in Supply Chain Management (SCM)**: Operations strategy, multi-echelon inventory control, procurement, distribution logistics.
- **Extracurricular Corporate Leadership (BIZ BEE)**:
  - Corporate Relations & Operations Lead at BRAC University Business Club.
  - Directed national corporate competitions (**BIZ BEE-BIZVERSE**, **BIZ BEE-BRAINIACS**), liaising directly with corporate sponsors including Marico, HSBC, Shanta Asset Management, and Perfetti Van Melle.

### 5. Contact & Outreach Channels (`#contact`)
- **Resilient 1-Click Email Copy**: `#copyEmailBtn` copies `irfanur6@gmail.com` with debounced 2000ms "Copied! ✓" visual feedback and fallback for non-secure contexts.
- **Direct Mailto Link**: Native mail client launch with pre-filled subject.
- **Professional Social Profiles**: LinkedIn, GitHub, and PROBAHO CRM repository.

---

## 🎨 Alice Lee Design System Tokens

The visual system is engineered from the ground up to reflect Alice Lee's (`byalicelee.com`) editorial elegance:
- **Typography Hierarchy**:
  - Headings & Display: Google Fonts `Bitter` (weights 300, 400, 500, 600, 700, italic 400).
  - Body & UI Controls: Google Fonts `Plus Jakarta Sans` (weights 400, 500, 600, 700).
  - Fluid clamp typography scaling across all screen widths.
- **Warm Editorial Color Palette**:
  - Canvas base: `--bg-canvas: #FAF8F5` and `--bg-canvas-alt: #FDFBF7`.
  - Surfaces: `--bg-surface: #FFFFFF` and soft pill beige `--bg-surface-soft: #F5F2EB`.
  - Text: Warm charcoal `--text-headline: #2D2A26` and `--text-body: #4A4640`.
  - Accents: Soft terracotta `--accent-terracotta: #D97757`, hover `--accent-terracotta-hover: #C65E3E`.
  - Highlight / Selection: Signature peach `--accent-peach: #FFEDE7` and `--bg-selection: #FFEDE7`.
  - Divider: Signature gold-terracotta line gradient (`#F1E3D3` -> `#D97757` -> `#F1E3D3`).
- **Showcase Cards & Aspect Ratios**:
  - Flagship card ratio: `21 / 8` (Desktop), responsive `auto` on mobile to prevent content clipping.
  - Profile portrait: `4 / 5` aspect ratio with subtle elevation.
  - Subtle `4px` elevation lift on pointer-enabled desktop hover (`transform: translateY(-4px)`).
- **Navigation Usability**:
  - `html { scroll-behavior: smooth; scroll-padding-top: 96px; }` prevents sticky header occlusion of section headings.
  - Active nav indicator highlights via scroll-spy runtime.
  - Fully functional, accessible mobile navigation on viewports `<= 768px`.

---

## 🛠️ Verification & Testing

Verify syntax and structure locally:

```powershell
# Validate JavaScript syntax
node -c script.js

# Verify DOM section anchors and interactive elements
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
['home', 'software', 'experience', 'academics', 'contact', 'copyEmailBtn', 'caseStudyModal'].forEach(id => {
  console.log(id, html.includes('id=\"' + id + '\"') ? 'OK' : 'MISSING');
});
"

# Run local preview server
python -m http.server 8000
```

---

## 📬 Contact

- **Email**: [irfanur6@gmail.com](mailto:irfanur6@gmail.com)
- **LinkedIn**: [linkedin.com/in/irfanur-rahman123](https://www.linkedin.com/in/irfanur-rahman123/)
- **GitHub**: [github.com/GlichPoP](https://github.com/GlichPoP)
- **PROBAHO CRM Repo**: [github.com/GlichPoP/probaho-crm](https://github.com/GlichPoP/probaho-crm)
