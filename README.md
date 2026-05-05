# 🧠 MindMate — AI-Powered Mental Wellness Platform

MindMate is a full-stack AI-driven mental wellness application designed to help users track emotions, build healthy habits, and gain personalized insights into their mental state. It combines real-time AI emotion analysis, journaling, and wellness tracking into a seamless user experience.

## 🎥 Demo
  

https://github.com/user-attachments/assets/9466e08f-361b-4920-b473-7a8ce445112e




---

# 🚀 Features

* 🧠 AI-powered emotion detection & stress analysis
* 📊 Mood analytics and trend visualization
* 💧 Wellness tracking (water, habits)
* 📝 Daily journaling with date navigation & editing
* 💬 Clean chat interface for interaction
* 🔐 Secure authentication (JWT + Refresh Tokens + Google OAuth)
* ⚙️ Theme control (Light/Dark mode)
* 📱 Responsive and minimal UI

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router
* Axios
* Context API (Auth management)
* Framer Motion (animations)
* Custom CSS (minimal SaaS UI)

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose

## AI Integration (Groq API)

MindMate uses the Groq API to perform real-time emotion analysis on user input.

* Input: User text (journal/chat)
* Processing:

  * Sentiment detection
  * Emotion classification (happy, sad, stress, etc.)
  * Stress scoring logic
* Output:

  * Emotion label
  * Stress level
  * AI-generated wellness suggestions

The backend formats prompts and parses responses to generate structured emotional insights.

---

## Authentication

* JWT (Access Token + Refresh Token)
* Passport.js (Google OAuth)

## Deployment

* Frontend: Vercel
* Backend: Render

---

# 📂 Project Structure

```id="project-structure"
MindMate/
│
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Cards, etc.)
│   │   ├── pages/           # Page-level components (Login, Dashboard, Journal)
│   │   ├── context/         # Global state (AuthContext, ThemeContext)
│   │   ├── utils/           # Helper functions (API config, interceptors)
│   │   └── App.js           # Main app routing
│
├── server/                  # Backend API
│   ├── src/
│   │   ├── controllers/     # Business logic (auth, journal, wellness)
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── config/          # DB, Passport, environment setup
│   │   └── utils/           # Token handling, helpers
│   │
│   └── server.js            # Entry point
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 📌 Prerequisites

* Node.js (v16 or higher)
* MongoDB Atlas account
* Groq API key
* Google OAuth credentials

---

## 1️⃣ Clone Repository

```bash id="clone"
git clone https://github.com/your-username/mindmate.git
cd mindmate
```

---

## 2️⃣ Backend Setup

```bash id="backend-install"
cd server
npm install
```

### Create `.env` file (server):

```env id="backend-env"
PORT=5000
MONGO_URI=your_mongodb_connection

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

CLIENT_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

### Run Backend:

```bash id="backend-run"
node index.js
```

---

## 3️⃣ Frontend Setup

```bash id="frontend-install"
cd client
npm install
```

### Create `.env` file (client):

```env id="frontend-env"
REACT_APP_API_URL=http://localhost:5000
```

### Run Frontend:

```bash id="frontend-run"
npm start
```

---

# 🔑 API Endpoints

## Auth Routes

| Method | Endpoint                  | Description      |
| ------ | ------------------------- | ---------------- |
| POST   | `/api/auth/signup`        | Register user    |
| POST   | `/api/auth/login`         | Login user       |
| POST   | `/api/auth/logout`        | Logout user      |
| POST   | `/api/auth/refresh-token` | Refresh JWT      |
| GET    | `/api/auth/me`            | Get current user |

---

# 🔐 Authentication Flow

```id="auth-flow"
User Login → Access Token (short-lived) + Refresh Token (long-lived)
     ↓
Access Token stored in memory / localStorage
     ↓
Every API request → Authorization: Bearer <access_token>
     ↓
Token expired? → Auto-refresh using refresh token
     ↓
Refresh token expired? → Redirect to login
```

---

# 🎨 UI/UX Highlights

* Minimal, clean SaaS-style interface
* Collapsible sidebar navigation
* Smooth transitions and animations
* Focus on usability over visual clutter
* Responsive layout

---

# 🚀 Performance Optimizations

* Lazy loading (React.lazy + Suspense)
* Axios interceptors for efficient API calls
* Reduced re-renders using proper state management
* Clean component architecture

---

# 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash id="contributing"
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "Add some feature"

# Push to your branch
git push origin feature/your-feature-name
```

Then open a Pull Request.

👉 Please open an issue first for major changes so we can discuss the approach.

---
📸 Screenshots
<img width="1888" height="870" alt="image" src="https://github.com/user-attachments/assets/5673f1cc-c103-4d0b-93ad-a7e25d502b75" /> //login page

<img width="1899" height="873" alt="image" src="https://github.com/user-attachments/assets/110a6a2d-eaf4-407b-b407-861286b11a01" /> //home page



# 🧑‍💻 Author

**Chaitanya Reddy**

* GitHub: https://github.com/chaitanyaReddy4/mindmate.git
* LinkedIn: http://linkedin.com/in/chaitanya-reddy-ustalamuri-812634329?originalSubdomain=in

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you find this project useful:

* ⭐ Star the repository
* 🍴 Fork it
* 💡 Share feedback

---

# 💬 Final Note

MindMate demonstrates how AI, full-stack engineering, and thoughtful UI/UX can be combined to build meaningful, real-world applications.
