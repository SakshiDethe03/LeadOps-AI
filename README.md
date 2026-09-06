# LeadOps AI 🚀

AI-powered lead qualification and follow-up automation built with **Google Gemini, Make.com, Google Sheets, and JavaScript**.

LeadOps AI captures incoming leads, analyzes their buying intent and requirements using Gemini, assigns a priority level, stores the result in Google Sheets, and automatically sends personalized follow-up emails to qualified leads.

---

## ✨ How It Works

```text
Lead Form
   ↓
Make.com Webhook
   ↓
Google Gemini
   ↓
Lead Qualification
   ↓
Parse JSON
   ↓
Google Sheets
   ↓
Conditional Follow-up Email
   ↓
Webhook Response
```

## 🧠 Lead Qualification

Gemini evaluates the lead based on:

- Buying intent
- Requirement specificity
- Urgency
- Business context
- Active vendor/solution evaluation

The lead is classified as:
| Priority  | Description                                      | Action     |
| --------- | ------------------------------------------------ | ---------- |
| 🔴 HIGH   | Strong intent, clear requirement, or urgent need | Email sent |
| 🟡 MEDIUM | Genuine interest but lower urgency               | Email sent |
| ⚪ LOW     | General inquiry or weak buying intent            | No email   |

##### Example

<b>HIGH</b>
```
“We are evaluating AI chatbot solutions and want to start implementation next month. Please share pricing and integration details.”
```

→ Lead logged → Personalized email sent

<b>MEDIUM</b>
```
"We are exploring AI automation for our sales team and would like to learn more."
```
→ Lead logged → Personalized email sent

<b>LOW</b>
```
"I just want to know what your company does."
```
→ Lead logged → No email

## 📧 AI Follow-up

For HIGH and MEDIUM leads, Gemini generates a personalized email using the submitted lead information.

The system is instructed to:

- Use only provided information
- Avoid fabricated features, pricing, or guarantees
- Maintain a professional sales tone
- Address the lead by name

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- AI: Google Gemini
- Automation: Make.com
- Database: Google Sheets
- Email: Make.com Email Module

## 📁 Project Structure
```
leadops-ai/
├── index.html
├── styles.css
├── app.js
├── config.example.js
└── README.md
```

## ⚙️ Setup

- Clone the repository.
```
git clone https://github.com/SakshiDethe03/LeadOps-AI.git
cd LeadOps-AI
```

- Create your Make.com workflow.
```
Webhook
   ↓
Gemini
   ↓
Parse JSON
   ↓
Google Sheets
   ↓
Conditional Email
   ↓
Webhook Response
```

- Create config.js from config.example.js.
```
const config = {
    webhookUrl: 'YOUR_MAKE_WEBHOOK_URL'
};
```

- Open index.html using Live Server.

Keep config.js out of GitHub if it contains your actual webhook URL.

## 🎯 What This Project Demonstrates

LeadOps AI demonstrates an end-to-end AI automation pipeline where Generative AI output directly drives business actions such as lead prioritization, data logging, and conditional follow-up.

## 👩‍💻 Author

Sakshi Satish Dethe

AI & Automation Developer