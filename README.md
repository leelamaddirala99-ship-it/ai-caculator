# AI Calculator — Demo

This is a minimal demo web-based calculator with optional "Premium" demo license.

Features:
- Evaluate math expressions using math.js
- Symbolic simplify using nerdamer
- Basic graphing using Plotly
- Premium gating for step-by-step explanations (demo license: `PREMIUM-DEMO-2026`)
- History stored in `localStorage`, exportable as CSV

How to run:
1. Open `index.html` in a browser (no server required).
2. Enter expressions like `2+2`, `integrate(x^2,x)`, or `y = sin(x)`.
3. Click `Premium Features` and enter `PREMIUM-DEMO-2026` to unlock demo premium features.

**Premium Features (Demo)**:
- Step-by-step solution explanations (unlock with demo key `PREMIUM-DEMO-2026`)
- Advanced symbolic transforms (Laplace / Fourier) as Premium-only examples
- Export results as CSV/PNG (some exports are Premium)

Notes:
- This is a frontend-only demo. For production, integrate a backend for license verification and payments (Stripe/PayPal).
- Recommended production flow: backend (Node/Flask) + Stripe for payments + server-side license issuance + webhook-based license activation.