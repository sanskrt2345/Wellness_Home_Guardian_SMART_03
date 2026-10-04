# SMART-03 Wellness Home Guardian — Frontend (HTML/CSS/JS)

## Structure
```
frontend/
├── index.html                  Landing page (animated)
├── pages/                      One HTML file per page
│   ├── login.html              Sign In / Register (opens dashboard after login)
│   ├── dashboard.html
│   ├── new-assessment.html
│   ├── questionnaire.html      (?id=<assessmentId>)  5-section risk questionnaire
│   ├── image-upload.html       (?id=...)
│   ├── review.html             (?id=...)
│   ├── assessments.html
│   ├── results.html            (?id=...)
│   ├── recommendations.html
│   ├── wellness.html
│   ├── reports.html
│   ├── report.html             (?id=...)
│   ├── compare.html
│   ├── reassess.html
│   ├── profile.html
│   └── settings.html
├── css/
│   ├── base  layout  components  auth  pages  responsive   (shared)
│   ├── landing.css       landing page only
│   ├── dashboard.css     dashboard only
│   └── assessment.css    new assessment, questionnaire, results, report
└── js/
    ├── icons.js       SVG icons
    ├── core.js        state, localStorage, routing helpers, toast
    ├── layout.js      sidebar/topbar shell, count-up helper
    ├── questions.js   QUESTIONS + risk scoring (edit this to change the questionnaire)
    ├── analysis.js    answers -> findings, exposure, risk indicators, recommendations, wellness (edit rules here)
    ├── pdf.js         builds the Sanatan Labs PDF report (uses js/vendor/jspdf.umd.min.js)
    └── pages/         one JS file per page (same name as the HTML page)
```

## Questionnaire and scoring
- 5 sections, 31 questions (29 scored). Each option has a risk weight 0-3 in `js/questions.js`, written as `Label:risk`.
- Domain score = 100 - average risk, per domain (Ergonomics, Environment, Exposure, Movement, Recovery).
- Overall score = average of the domain scores. 80+ low risk, 60-79 moderate, below 60 high.
- Answers with risk 2 or more appear as "Key risk factors" on Results and Report.

## Run
Open `index.html` in a browser, or use VS Code Live Server.
Demo auth/settings/assessments are stored in `localStorage` / `sessionStorage`. No backend.
Wellness assessment tool, not a medical device.

## Results, recommendations and PDF report
- Review & Submit -> Results with tabs: Findings, Exposure, Risk Indicators, Recommendations, Wellness & Movement, Evidence.
- All of that text comes from `js/analysis.js` (rules that read the questionnaire answers).
- `Download Report` (Results page) and `Download PDF Report` (Report page) create `WHG-Report-<code>.pdf` in the browser.
- Images are shrunk and kept in sessionStorage; only name + category are kept with the assessment.
