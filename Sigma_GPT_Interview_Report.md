# Sigma GPT - Project Report and Interview Guide

## 1. Project Title

**Sigma GPT - AI Chat Application**

Sigma GPT is a full-stack AI chatbot web application where users can sign up, log in, start AI conversations, save chat history, rename chats, delete chats, copy responses, download conversations, and regenerate AI answers.

## 2. Short Interview Explanation

Sigma GPT is a ChatGPT-style full-stack web application that I built using React, Node.js, Express, MongoDB, Passport authentication, and the OpenAI API.

The frontend is built with React and Vite. It provides a clean chat interface, sidebar chat history, login/signup modal, quick-start prompts, copy message option, regenerate response, and download chat feature.

The backend is built with Express. It handles authentication, sessions, protected routes, chat requests, thread management, and communication with the OpenAI API. MongoDB stores users, chat threads, and messages.

The main goal of this project was to understand how a real AI SaaS-style application works end to end: authentication, API integration, database persistence, frontend state management, protected backend APIs, and user-friendly chat workflows.

## 3. Problem Statement

Many AI chat tools allow users to ask questions, but building one from scratch requires handling multiple real-world engineering problems:

- User authentication and session management
- Sending prompts to an AI model
- Storing previous conversations
- Managing multiple chat threads
- Building a responsive chat UI
- Handling errors such as failed backend, failed database, or failed AI request
- Keeping frontend and backend communication secure using protected routes

Sigma GPT solves these problems in one complete full-stack project.

## 4. Project Objectives

The main objectives of Sigma GPT are:

- Build a ChatGPT-like user interface.
- Allow users to create accounts and log in.
- Protect chat features so only authenticated users can use them.
- Send user prompts to the OpenAI API and show AI-generated replies.
- Save conversations in MongoDB.
- Allow users to manage chat threads.
- Improve usability with features like rename, delete, copy, regenerate, search, and download.
- Practice full-stack development with clean frontend and backend separation.

## 5. Tech Stack

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

### Tools

- npm
- ESLint
- Vite build system
- MongoDB Atlas

## 6. Main Features

### Authentication

- User signup
- User login
- User logout
- Session-based authentication
- Protected backend routes
- Frontend auth modal

### Chat Features

- Send messages to AI
- Receive AI-generated replies
- Store user and assistant messages
- View previous chat history
- Start a new chat
- Regenerate the latest assistant response
- Copy any message
- Download the current chat as Markdown
- Multi-line input with Shift+Enter support

### Thread Management

- View all saved chat threads
- Search chat history
- Rename a chat thread
- Delete a chat thread
- Load old conversations
- Highlight active thread

### User Experience

- Clean dark UI
- Sidebar navigation
- Loading indicator while waiting for AI response
- Profile dropdown
- Quick-start prompt cards
- Helpful error messages
- Responsive layout

## 7. System Architecture

The project follows a client-server architecture.

```text
React Frontend
    |
    | fetch requests with credentials
    v
Express Backend
    |
    | authentication/session check
    v
Protected API Routes
    |
    | save and read data
    v
MongoDB

Express Backend
    |
    | prompt request
    v
OpenAI API
```

## 8. Folder Structure

```text
Sigma GPT
|
|-- Frontend
|   |-- src
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- AuthProvider.jsx
|   |   |-- AuthModal.jsx
|   |   |-- chatwindow.jsx
|   |   |-- chat.jsx
|   |   |-- sidebar.jsx
|   |   |-- Mycontext.jsx
|   |   |-- useAuth.js
|   |   |-- CSS files
|   |
|   |-- package.json
|
|-- Backend
|   |-- server.js
|   |-- routes
|   |   |-- auth.js
|   |   |-- chat.js
|   |
|   |-- model
|   |   |-- user.js
|   |   |-- Thread.js
|   |
|   |-- middleware
|   |   |-- auth.js
|   |
|   |-- utils
|   |   |-- openai.js
|   |   |-- passport.js
|   |
|   |-- package.json
```

## 9. Backend Explanation

The backend is responsible for authentication, database operations, and AI communication.

### server.js

This is the main backend entry point. It:

- Creates the Express server
- Enables JSON parsing
- Configures CORS
- Configures sessions
- Initializes Passport
- Connects to MongoDB
- Mounts auth and chat routes
- Provides a health check endpoint

### Authentication Routes

The authentication routes handle:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

The app uses session-based authentication. After login, the browser stores a session cookie. Future requests include that cookie automatically because frontend fetch requests use `credentials: "include"`.

### Chat Routes

The chat routes handle:

- `POST /api/chat`
- `POST /api/chat/regenerate`
- `GET /api/thread`
- `GET /api/thread/:threadId`
- `PATCH /api/thread/:threadId`
- `DELETE /api/thread/:threadId`

All chat routes are protected, so a user must be logged in before using them.

## 10. Database Design

### User Model

The user model stores:

- Name
- Email
- Hashed password and salt through passport-local-mongoose
- Avatar
- Created date

Passwords are not stored as plain text.

### Thread Model

The thread model stores:

- Unique thread id
- Owner user id
- Chat title
- Messages array
- Created date
- Updated date

Each message stores:

- Role: user or assistant
- Content
- Timestamp

## 11. Frontend Explanation

The frontend is built with React and organized into reusable components.

### App.jsx

`App.jsx` stores shared chat state using React state and provides it through `MyContext`.

Important states:

- Current prompt
- Current thread id
- Previous chat messages
- New chat status
- All saved threads

### AuthProvider.jsx

`AuthProvider.jsx` manages authentication state.

It checks if the user is already logged in by calling:

```text
GET /api/auth/me
```

It also provides login, signup, logout, and modal controls to the whole frontend.

### ChatWindow

`chatwindow.jsx` manages:

- Message input
- Sending prompts
- Loading state
- User profile dropdown
- Regenerate response
- Download chat
- Notices and errors

### Chat

`chat.jsx` displays:

- Empty chat screen
- Quick-start prompts
- User messages
- Assistant messages
- Copy button for each message
- Markdown-rendered AI responses

### Sidebar

`sidebar.jsx` manages:

- New chat
- Chat history
- Search history
- Rename thread
- Delete thread
- Load selected thread

## 12. Data Flow

### Sending a Message

```text
User types message
    |
Frontend sends POST /api/chat
    |
Backend checks session
    |
Backend saves user message
    |
Backend calls OpenAI API
    |
Backend saves assistant response
    |
Frontend receives response
    |
Frontend updates chat UI
```

### Loading Chat History

```text
User clicks thread in sidebar
    |
Frontend calls GET /api/thread/:threadId
    |
Backend checks owner and session
    |
Backend returns saved messages
    |
Frontend displays old conversation
```

## 13. Security Points

Important security choices in the project:

- Passwords are hashed.
- Authentication uses server-side sessions.
- Chat routes are protected.
- Cookies are sent with `credentials: "include"`.
- CORS is configured for local frontend origins.
- User-specific threads are linked to the logged-in user.
- Sensitive API keys are stored in environment variables.

## 14. Error Handling

The app handles:

- User not logged in
- Backend not running
- Database connection failure
- OpenAI API failure
- Invalid login/signup data
- Missing message input
- Missing thread
- CORS issues during development

The backend also has a health endpoint:

```text
GET /api/health
```

It returns backend and database status.

## 15. Challenges Faced

### 1. CORS and Session Cookies

The frontend and backend run on different ports, so the browser blocks requests unless CORS is configured correctly. I fixed this by allowing local Vite ports and enabling credentials on both frontend fetch requests and backend CORS.

### 2. Authentication Flow

Session-based authentication needs Passport, express-session, cookies, and protected middleware to work together. I learned how login creates a session and how future requests use that session.

### 3. Chat Persistence

The app needed to save every user message and AI response inside the correct thread. I handled this using MongoDB thread documents with a messages array.

### 4. Better User Experience

A basic chatbot is easy, but a useful chatbot needs history, rename, delete, regenerate, copy, download, and proper loading states. I improved the app with those productivity features.

## 16. Testing and Verification

I verified the project using:

```bash
npm run build
npm run lint
node --check server.js
```

I also tested:

- Backend health endpoint
- CORS preflight
- Frontend production build
- Backend route imports
- Database connection

## 17. How to Run the Project

### Backend

```bash
cd Backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

If port `5173` is busy, Vite may use `5174`.

## 18. Future Scope

Future improvements can include:

- Streaming AI responses token by token
- File upload and document chat
- Voice input
- Image generation support
- Better profile page
- Chat sharing link
- Admin dashboard
- Rate limiting
- Deployment on cloud
- Mobile sidebar drawer
- Prompt templates library

## 19. Interview Pitch - 30 Seconds

Sigma GPT is a full-stack AI chat application similar to ChatGPT. I built it using React on the frontend and Express with MongoDB on the backend. It supports authentication, session-based protected routes, AI responses through the OpenAI API, saved chat history, thread management, rename, delete, regenerate, copy, download, and quick-start prompts. This project helped me understand how real AI products combine frontend UI, backend APIs, authentication, database storage, and external AI services.

## 20. Interview Pitch - 1 Minute

My project is Sigma GPT, a ChatGPT-style full-stack AI application. Users can create an account, log in, start a new chat, send prompts to the AI, and save their conversations.

On the frontend, I used React and Vite. I built a sidebar for chat history, a main chat window, an auth modal, quick-start prompts, message copy buttons, regenerate response, and download chat functionality.

On the backend, I used Node.js, Express, MongoDB, Mongoose, Passport, and express-session. The backend protects chat routes, manages users, stores conversations in MongoDB, and sends prompts to the OpenAI API.

The most important learning from this project was understanding how a full-stack AI app works end to end, especially session authentication, CORS with cookies, database persistence, and AI API integration.

## 21. Interview Pitch - Technical Version

Sigma GPT is a full-stack AI chat system built with React, Express, MongoDB, Passport authentication, and the OpenAI API.

The frontend uses React Context to manage shared chat state like current prompt, selected thread, previous messages, and thread list. It communicates with the backend using fetch requests with credentials enabled, so the browser sends the session cookie with each protected request.

The backend uses Express for routing, express-session for session storage, Passport with passport-local-mongoose for login/signup, and Mongoose for database models. Chat routes are protected using middleware that checks whether the user is authenticated.

When a user sends a message, the backend saves the user message to a MongoDB thread, calls the OpenAI API, saves the assistant response, and returns it to the frontend. Each thread belongs to a user, so chat history is separated per account.

I also added production-like features such as chat history search, rename thread, delete thread, regenerate response, copy message, download conversation, quick prompts, and backend health checks.

## 22. Common Interview Questions and Answers

### Q1. Why did you build this project?

I built Sigma GPT to understand how modern AI applications work end to end. I wanted to learn not only how to call an AI API, but also how to build authentication, database storage, protected APIs, and a usable chat interface around it.

### Q2. What is the main feature of your project?

The main feature is an authenticated AI chat system where each user can create and manage multiple AI chat threads. Conversations are saved in MongoDB and can be reopened later.

### Q3. How does authentication work?

Authentication is session-based. The user signs up or logs in using email and password. Passport authenticates the user and creates a session. The browser stores the session cookie, and future API requests send that cookie with `credentials: "include"`.

### Q4. How is chat history saved?

Each conversation is stored as a thread document in MongoDB. A thread has a unique thread id, owner user id, title, and a messages array. Every user message and assistant response is pushed into that messages array.

### Q5. How do you call the AI model?

The backend receives the user's message and sends it to the OpenAI API. The AI response is returned to the backend, saved into MongoDB, and then sent back to the frontend.

### Q6. Why did you use React Context?

I used React Context because multiple components need shared chat state. For example, the sidebar needs the current thread id, and the chat window needs the current messages. Context avoids passing props through many component levels.

### Q7. What was the hardest part?

The hardest part was making authentication, CORS, and session cookies work correctly between frontend and backend running on different ports. I solved it by configuring backend CORS with credentials and sending fetch requests with `credentials: "include"`.

### Q8. How did you protect user data?

Protected backend middleware checks whether the user is authenticated before allowing access to chat routes. Threads are also linked to the logged-in user, so users only see their own chat history.

### Q9. What would you improve next?

I would add streaming AI responses, file upload, mobile sidebar improvements, rate limiting, and deployment. Streaming would make responses feel faster and more natural.

### Q10. What did you learn?

I learned how to connect frontend, backend, database, authentication, and an external AI API into one complete application. I also learned how important error handling and user experience are in a real project.

## 23. Simple Explanation in Easy Words

This project is like my own version of ChatGPT.

A user can create an account, log in, and ask questions. The question goes from the React frontend to the Express backend. The backend checks if the user is logged in, sends the question to the OpenAI API, receives the answer, saves the conversation in MongoDB, and sends the answer back to the frontend.

The user can also see old chats, rename them, delete them, search them, copy messages, regenerate answers, and download the conversation.

So this project shows that I can build a complete full-stack application with frontend, backend, database, authentication, and AI integration.

## 24. Best Closing Line for Interview

Sigma GPT is not just an API demo. It is a complete full-stack AI application with authentication, persistent chat history, protected routes, database integration, and a polished user experience. It helped me understand how real AI products are designed and built.

