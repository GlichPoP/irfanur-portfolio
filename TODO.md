# Portfolio Action Items and Findings (TODO.md)

## 1. FIN423 Sharpe Ratio Calculation Discrepancy

- **Reported Figures in PDF (Pages 30, 31, 33, 38):**
  - Optimum Portfolio Expected Return: 56.59%
  - Optimum Portfolio Risk (Standard Deviation): 14.25%
  - Reported Optimum Sharpe Ratio: 3.44
  - Portfolio Weights: BRAC Bank 51%, Square Pharmaceuticals 28%, Grameenphone 21%, Apex Tannery 0%

- **Stated Risk-Free Rate in PDF (Appendices B and C, Pages 35 and 36):**
  - 365-day Bangladesh Bank Treasury Bill rate cited in CAPM tables: 10.71% (also cited as 10.87% on page 36).

- **Discrepancy Analysis:**
  - Standard Sharpe ratio equation: `Sharpe = (Expected Return - Risk-Free Rate) / Portfolio Risk`
  - Evaluating with the PDF's stated 10.71% Treasury Bill rate:
    `(56.59% - 10.71%) / 14.25% = 45.88% / 14.25% = 3.2196 ≈ 3.22`
  - This calculation yields 3.22, creating an unreconciled gap of +0.22 against the printed 3.44.
  - Solving for the implied risk-free rate that yields 3.44:
    `Implied Rf = 56.59% - (3.44 * 14.25%) = 56.59% - 49.02% = 7.57%`
  - Across all four portfolios in Appendix E (Page 38), the implied risk-free rate is consistently ~7.6%:
    - Portfolio 1 (Equally Weighted, 42.72% return, 11.98% risk, 2.93 Sharpe): Implied Rf = 7.62%
    - Portfolio 2 (Random Weights, 46.01% return, 12.34% risk, 3.11 Sharpe): Implied Rf = 7.63%
    - Portfolio 3 (Minimum Variance, 29.65% return, 9.92% risk, 2.22 Sharpe): Implied Rf = 7.63%
    - Portfolio 4 (Optimum Portfolio, 56.59% return, 14.25% risk, 3.44 Sharpe): Implied Rf = 7.57%
    *(Note: Line 37 of Page 38 lists Apex Tannery's annualized return as 7.65%, which closely aligns with this ~7.6% implied rate).*
  - The PDF text and portfolio tables nowhere cite, define, or explain an Rf of 7.57% or 7.65% for the Sharpe ratio calculations.

- **Action Taken on Card:**
  - Per instructions, because the 3.44 figure cannot be reconciled with the stated risk-free rate of 10.71%, the Sharpe figure has been hidden from the FIN423 card on the website.
  - The card displays the verified factual figures: **56.59% Optimum expected return** and **14.25% Optimum portfolio risk**, alongside the **51% / 28% / 21% optimal asset allocation**.
  - The card calculation note states: `Calculated from 250 trading days of annualised daily returns across four DSE equities, yielding 56.59% expected return and 14.25% risk across 34 simulated weight combinations. The PDF notes a 10.71% Treasury bill rate in its CAPM appendix.`

---

## 2. FIN422 Course Title and Coverage Verification

- **PDF Cover Information:** The PDF title page lists `FIN422: Fundamentals of Investments` (Fall 2024, Section 03), and the term paper title is `Equity Research Report and Valuation Analysis`.
- **Company Coverage:** The paper performs an in depth equity valuation specifically on Square Pharmaceuticals Ltd (calculating FCFF of BDT 210.98 and FCFE of BDT 208.00) while benchmarking performance and historical volatility against four domestic pharmaceutical firms (Square Pharmaceuticals, Beximco Pharma, Renata, and Ibn Sina).
- **Card Status:** Title updated to `Equity Research Report and Valuation Analysis of Square Pharmaceuticals Ltd`, keeping the course label `FIN422: Fundamentals of Investments, 2024`.
- **Card Summary:** Updated to state that the paper values Square Pharmaceuticals and benchmarks it against Beximco Pharma, Renata and Ibn Sina.

---

## 3. PROBAHO CRM Media Assets Request

- **Current Status:** The `assets/probaho` folder currently contains no additional media files beyond the high resolution desktop dashboard mockup. Per instructions, the gallery remains hidden until additional screenshots are provided.
- **Request for Irfanur:** To display an interactive screenshot gallery and demo walkthrough, please provide:
  1. 3 to 5 additional screenshots of key workflows (e.g. POS counter billing, inventory stock management, courier delivery configuration for Pathao/Steadfast, and backup export).
  2. A short demo video (30 to 60 seconds, MP4 or WebM format) demonstrating offline POS order entry and receipt printing.

---

## 4. Privacy Scan and Redaction Log (Completed)

- All 8-digit student ID numbers (including Irfanur's and classmates') were permanently excised across all three academic research PDFs using true vector redaction in PyMuPDF.
- Zero 8-digit numbers remain across all 108 pages (verified via full-text extraction).
- Author/creator metadata purged from all files.
- Cover thumbnails regenerated in `assets/` at 850x1100 with zero visible IDs.
