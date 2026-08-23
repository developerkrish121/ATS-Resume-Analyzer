# ATS Resume Analyzer

An AI-powered full-stack ATS Resume Analyzer that evaluates how well a resume matches a job description, identifies matched and missing keywords, calculates an ATS score, and stores analysis history.

## 🚀 Live Demo

**Frontend:**  
https://ats-resume-analyzer-wheat.vercel.app

**Backend API:**  
https://ats-resume-analyzer-api-gzbq.onrender.com

---

## ✨ Features

- 📄 Upload PDF resumes
- 🎯 Compare resumes against job descriptions
- 📊 Generate ATS compatibility scores
- 🔑 Detect matched and missing job keywords
- 🤖 Optional AI-powered resume insights using Google Gemini
- 🗂️ Store and retrieve analysis history
- 🗑️ Delete previous analyses
- 🔒 Secure API configuration using environment variables
- 🚦 API rate limiting and request validation
- 🌐 Fully deployed production architecture

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Vercel          │
                    │   React + Vite       │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       Render         │
                    │   Node.js + Express   │
                    │      Backend API      │
                    └───────┬────────┬─────┘
                            │        │
                            │        │
                            ▼        ▼
                   ┌────────────┐  ┌──────────────┐
                   │ MongoDB    │  │ Google       │
                   │ Atlas      │  │ Gemini API   │
                   │            │  │ (Optional)   │
                   └────────────┘  └──────────────┘
