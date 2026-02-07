# ProjectCreate - AI-Powered Project Generator

A full-stack application similar to **Bolt.new** that leverages Google's Gemini API to generate production-ready projects in the browser. Users can describe their project idea, and the AI generates complete, runnable code with a live preview.

## 🌟 Features

- **AI-Powered Code Generation**: Uses Google Gemini 1.5 Flash API to generate code
- **Framework Detection**: Automatically detects whether the project should be React or Node.js based on user input
- **Live Code Editor**: VS Code-like code editor with syntax highlighting
- **Project Preview**: Run and preview projects directly in the browser using WebContainer
- **File Explorer**: Navigate and view all generated project files
- **Iterative Development**: Ask follow-up questions to refine and improve your project
- **Production-Ready**: Generates properly structured, professional-grade code

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Runtime**: WebContainer API (runs Node.js in browser)
- **UI Components**: Lucide React icons
- **HTTP Client**: Axios

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **AI Provider**: Google Gemini API
- **Environment**: Node.js

## 📋 Prerequisites

- Node.js 16+ and npm/pnpm
- Google Gemini API key (get from https://makersuite.google.com/app/apikey)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ProjectCreate/backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
ProjectCreate/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server setup
│   │   ├── prompts.ts            # System prompts for AI
│   │   ├── constants.ts          # Constants
│   │   ├── stripindents.ts       # Utility functions
│   │   ├── defaults/             # Default templates
│   │   │   ├── react.ts          # React project template
│   │   │   └── node.ts           # Node.js project template
│   │   └── services/
│   │       └── aiService.ts      # Gemini AI service
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   ├── config.ts             # Backend URL config
│   │   ├── steps.ts              # XML parsing logic
│   │   ├── components/           # React components
│   │   │   ├── Header.tsx
│   │   │   ├── ProjectInput.tsx
│   │   │   ├── Workspace.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── PreviewFrame.tsx
│   │   │   └── ...
│   │   ├── types/                # TypeScript types
│   │   └── hooks/                # React hooks
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## 🔄 How It Works

1. **User Input**: User enters a project description (e.g., "Create a todo app with React")
2. **Framework Detection**: Backend sends the input to Gemini to determine React vs Node.js
3. **Project Generation**: Backend generates complete project structure with all necessary files
4. **UI Rendering**: Frontend parses the response and displays files in the explorer
5. **WebContainer Mount**: Files are mounted into WebContainer runtime
6. **Live Preview**: User can view code and see live preview of the project
7. **Iteration**: User can refine the project with follow-up prompts

## 🔌 API Endpoints

### POST `/template`
Determines the project type (React or Node.js)

**Request:**
```json
{
  "prompt": "Create a React todo app"
}
```

**Response:**
```json
{
  "prompt": ["base_prompt", "framework_specific_prompt"],
  "uiPrompt": "React template string"
}
```

### POST `/chat`
Generates/updates project code based on prompts

**Request:**
```json
{
  "message": {
    "role": "user",
    "parts": [
      { "text": "base prompt" },
      { "text": "framework prompt" },
      { "text": "user request" }
    ]
  }
}
```

**Response:**
```json
{
  "response": "<boltArtifact>...</boltArtifact>"
}
```

### GET `/health`
Health check endpoint

## 🎯 Key Technologies

| Technology | Purpose |
|-----------|---------|
| **Gemini 2.0 Flash** | AI code generation |
| **WebContainer API** | Run Node.js in browser |
| **React 18** | Frontend UI framework |
| **Vite** | Frontend bundler |
| **Express** | Backend API server |
| **Tailwind CSS** | Styling |
| **TypeScript** | Type safety |

## 🧠 AI System Prompts

The application uses sophisticated system prompts to:
- Guide Gemini to generate production-quality code
- Ensure proper use of modern libraries (React hooks, Tailwind CSS, Lucide icons)
- Format code in the boltArtifact XML format for parsing
- Maintain consistency across generated projects

## 🐛 Troubleshooting

### Backend won't start
- Ensure `GEMINI_API_KEY` is set correctly
- Check if port 3000 is already in use
- Verify Node.js version is 16+

### Frontend connection errors
- Ensure backend is running on `http://localhost:3000`
- Check CORS settings in `backend/src/index.ts`
- Clear browser cache and refresh

### Gemini API errors
- Verify API key is valid and has quota
- Check internet connection
- Review rate limiting

## 📚 Learning Resources

- [Google Gemini API Docs](https://ai.google.dev)
- [WebContainer API](https://webcontainer.io)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)

## 🔐 Security Considerations

- Never commit `.env` files with real API keys
- Use environment variables for sensitive data
- Sanitize user inputs before passing to AI
- Validate API responses before rendering

## 🚀 Production Deployment

### Backend Deployment (Vercel/Heroku)
```bash
npm run build
npm start
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

Update `FRONTEND_URL` and `BE_URL` for production endpoints.

## 📝 Contributing

To improve the project:
1. Update system prompts in `backend/src/prompts.ts`
2. Add new templates in `backend/src/defaults/`
3. Enhance UI components in `frontend/src/components/`
4. Improve error handling and validation

## 📄 License

MIT

## 🤝 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review API logs and browser console
3. Verify environment configuration

---

**Built with ❤️ using Gemini AI, React, and WebContainer**