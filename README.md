# Sigma GPT

Sigma GPT is a full-stack AI chat application inspired by ChatGPT. It includes user authentication, session-protected chat routes, OpenAI-powered responses, saved chat history, thread management, quick prompts, copy/download tools, and a clean React interface.

## Overview

This project demonstrates how a modern AI web application works end to end:

- React frontend for the chat UI
- Express backend for APIs and authentication
- MongoDB for users, chat threads, and messages
- Passport session authentication
- OpenAI API integration for AI replies
- Protected user-specific chat history

## Features

- User signup, login, logout
- Session-based authentication
- Protected chat APIs
- AI-generated chat replies
- Saved conversation history
- Create, open, rename, search, and delete chat threads
- Regenerate latest assistant response
- Copy individual messages
- Download a chat as Markdown
- Quick-start prompt cards
- Multi-line message input
- Backend health check endpoint
- Local Vite CORS support for ports `5173` through `5179`

## Tech Stack

### Frontend

- React
- Vite
- CSS
- React Context API
- React Markdown
- rehype-highlight
- react-spinners
- uuid

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- passport-local-mongoose
- express-session
- cors
- dotenv
- OpenAI API

## Project Structure

```text
Sigma GPT/
├── Backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── model/
│   │   ├── Thread.js
│   │   └── user.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chat.js
│   ├── utils/
│   │   ├── openai.js
│   │   └── passport.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AuthModal.jsx
│   │   ├── AuthProvider.jsx
│   │   ├── chat.jsx
│   │   ├── chatwindow.jsx
│   │   ├── sidebar.jsx
│   │   └── useAuth.js
│   ├── package.json
│   └── vite.config.js
├── Sigma_GPT_Interview_Report.md
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sigma-gpt.git
cd sigma-gpt
```

### 2. Configure backend environment

Create a real `.env` file from the example:

```bash
cd Backend
cp .env.example .env
```

Fill in these values:

```text
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=your_mongodb_connection_string_here
SESSION_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
PORT=8000
```

### 3. Install backend dependencies

```bash
cd Backend
npm install
npm start
```

Backend runs at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/api/health
```

### 4. Install frontend dependencies

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

If port `5173` is busy, Vite may use `5174`.

## API Routes

### Auth

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Chat and Threads

```text
POST   /api/chat
POST   /api/chat/regenerate
GET    /api/thread
GET    /api/thread/:threadId
PATCH  /api/thread/:threadId
DELETE /api/thread/:threadId
```

### Health

```text
GET /api/health
```

## How It Works

1. A user signs up or logs in.
2. The backend creates a server-side session using Passport and Express Session.
3. The frontend sends API requests with `credentials: "include"` so the session cookie is included.
4. Protected chat routes verify the session.
5. User messages are saved in MongoDB.
6. The backend sends the prompt to the OpenAI API.
7. The assistant response is saved in the same thread.
8. The frontend displays the updated conversation.

## Security Notes

- Do not commit `.env` files.
- Use `.env.example` for public configuration placeholders.
- Keep `OPENAI_API_KEY`, `MONGODB_URL`, and `SESSION_SECRET` private.
- If a secret is ever pushed to GitHub, rotate it immediately.

## Development Checks

Frontend:

```bash
cd Frontend
npm run build
npm run lint
```

Backend:

```bash
cd Backend
node --check server.js
```

## Interview Report

An interview-ready explanation is included:

```text
Sigma_GPT_Interview_Report.md
```

It contains the project explanation, architecture, features, challenges, and common interview questions.

## Future Improvements

- Streaming AI responses
- File upload and document chat
- Voice input
- Chat sharing links
- Profile settings page
- Rate limiting
- Deployment setup
- Mobile sidebar drawer

## GitHub Push Guide

Use these commands from the project root:

```bash
git init
git add .
git commit -m "Initial commit: Sigma GPT full-stack AI chat app"
git branch -M main
git remote add origin https://github.com/your-username/sigma-gpt.git
git push -u origin main
```

Before pushing, confirm ignored files are not staged:

```bash
git status
```

Make sure `.env`, `node_modules`, `dist`, and log files are not included.

