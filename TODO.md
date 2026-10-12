# Portfolio Action Items and Findings (TODO.md)

## 1. Forensic Privacy Scan of Academic Research PDFs

A complete forensic scan was conducted across all three academic research PDF files in `pdfs/`.

### Findings
- **Phone Numbers:** None found.
- **Home Addresses:** None found.
- **Personal Email Addresses:** None found.
- **Student ID Numbers and Classmate Names:** Identified on the title and contribution pages as follows:

#### `pdfs/fin422-equity-research-pharma-valuation.pdf` (Page 1)
- Course: FIN422: Fundamentals of Investments (Section 03, Fall 2024)
- Title: Equity Research Report and Valuation Analysis
- Instructor: Alavi Khondoker, Senior Lecturer
- Ariana Zaima Haque (Student ID: 21204016)
- Muttaqi Mashrur Ahnaf (Student ID: 20204003)
- Riyana Mohiuddin (Student ID: 21204011)
- Irfanur Rahman (Student ID: 21204012)
- Md Shafin Ahmed (Student ID: 21204119)

#### `pdfs/fin423-portfolio-optimization-efficient-frontier.pdf` (Page 2)
- Course: FIN423 (Securities Analysis and Portfolio Management)
- Sabit Mohammed Walid Adnan (Student ID: 21304020)
- Irfanur Rahman (Student ID: 21204012)
- Elma Taseen (Student ID: 22204239)
- Sajid Asif (Student ID: 21104053)

#### `pdfs/fin433-equity-research-square-pharmaceuticals.pdf` (Page 1)
- Course: FIN433: Financial Modeling (Spring 2025)
- Title: Equity Research and Valuation of Square Pharmaceuticals Ltd
- Instructor: Farhana Zahir, CFA, FRM
- Khandokar Md Rakibul Hasan Chondon (Student ID: 22304057)
- Khondokar Shah Poran (Student ID: 22304080)
- Md Shafin Ahmed (Student ID: 21204119)
- Ariana Zaima (Student ID: 21204016)
- Irfanur Rahman (Student ID: 21204012)
- Riyana Mohiuddin (Student ID: 21204011)

*Note: Per instruction, these PDF files have not been edited. If you prefer to redact your classmates' student IDs and names before sharing publicly, you can replace the files in `pdfs/` with redacted copies.*

---

## 2. FIN422 Course Title and Coverage Verification

- **PDF Cover Information:** The PDF title page lists `FIN422: Fundamentals of Investments` (Fall 2024, Section 03), and the term paper title is `Equity Research Report and Valuation Analysis`.
- **Company Coverage:** The paper performs an in depth equity valuation specifically on Square Pharmaceuticals Ltd (calculating FCFF of BDT 210.98 and FCFE of BDT 208.00) while benchmarking performance and historical volatility against four domestic pharmaceutical firms (Square Pharmaceuticals, Beximco Pharma, Renata, and Ibn Sina).
- **Current Card Status:** The card course pill has been updated to `FIN422: Fundamentals of Investments, 2024`.
- **Question for Irfanur:** Please confirm whether you would like to keep the title as `Valuation Analysis and Industry Research of Bangladesh Pharmaceuticals` or change it to `Equity Research Report and Valuation Analysis of Square Pharmaceuticals Ltd`.

---

## 3. FIN423 Methodology and Calculation Verification

- **Calculation Note:** Added under the metrics grid:
  `Calculated from 250 trading days of annualised daily returns across four DSE equities using a 10.71% risk free rate and 34 simulated portfolio weight combinations.`
- **Verified Facts from PDF:**
  - Data period: 250 trading days (daily stock returns).
  - Annualisation: Annualised returns and variance calculated using 250 trading days.
  - Risk free rate: 10.71% (365 day Bangladesh Bank Treasury bill rate cited in Appendix CAPM).
  - Portfolio universe: Four DSE equities (BRAC Bank, Grameenphone, Square Pharmaceuticals, Apex Tannery).
  - Frontier simulation: 34 simulated weight combinations across the Markowitz efficient frontier to locate the Maximum Sharpe Ratio Portfolio (Sharpe 3.44, return 56.59%, risk 14.25%).

---

## 4. PROBAHO CRM Media Assets Request

- **Current Status:** The `assets/probaho` folder currently contains no additional media files beyond the high resolution desktop dashboard mockup.
- **Request for Irfanur:** To display an interactive screenshot gallery and demo walkthrough, please provide:
  1. 3 to 5 additional screenshots of key workflows (e.g. POS counter billing, inventory stock management, courier delivery configuration for Pathao/Steadfast, and backup export).
  2. A short demo video (30 to 60 seconds, MP4 or WebM format) demonstrating offline POS order entry and receipt printing.
