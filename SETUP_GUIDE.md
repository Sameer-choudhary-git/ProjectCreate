# ProjectCreate - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Verification](#verification)
4. [Troubleshooting](#troubleshooting)
5. [First Run](#first-run)

---

## Prerequisites

Before you start, ensure you have:

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 16 or higher
- **npm**: Version 7 or higher (comes with Node.js)

### API Requirements
- **Google Account**: For accessing Gemini API
- **Gemini API Key**: Free tier available at [makersuite.google.com](https://makersuite.google.com/app/apikey)

### Check Your Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## Step-by-Step Setup

### Step 1: Get Gemini API Key

1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API key in new project"
3. Copy your API key (starts with `AIza...`)
4. Keep it safe - never share or commit it to version control

### Step 2: Clone/Navigate to ProjectCreate

```bash
# If you have the project directory
cd ProjectCreate
```

### Step 3: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your API key
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Edit backend/.env:**
```
GEMINI_API_KEY=paste_your_api_key_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Verify installation:**
```bash
# Check if dependencies are installed
ls node_modules | head -10

# Build TypeScript
npm run build
```

### Step 4: Setup Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Verify installation
ls node_modules | head -10
```

### Step 5: Verify Configuration

**Backend (.env file exists and has):**
- ✅ GEMINI_API_KEY is set
- ✅ PORT=3000
- ✅ FRONTEND_URL=http://localhost:5173

**Frontend (no env needed, uses default)**
- ✅ Backend URL in `src/config.ts` is `http://localhost:3000`

---

## Verification

### Backend Verification

```bash
cd backend

# Build TypeScript
npm run build

# Check for dist folder
ls dist/
```

You should see:
- `dist/index.js`
- `dist/prompts.js`
- `dist/services/aiService.js`

### Frontend Verification

```bash
cd frontend

# Check Vite config
cat vite.config.ts
```

---

## First Run

### Terminal 1: Start Backend

```bash
cd ProjectCreate/backend
npm run dev
```

Expected output:
```
✓ ProjectCreate Backend running on http://localhost:3000
✓ Frontend CORS origin: http://localhost:5173
```

### Terminal 2: Start Frontend

```bash
cd ProjectCreate/frontend
npm run dev
```

Expected output:
```
VITE v5.4.2  ready in 234 ms

➜  Local:   http://localhost:5173/
```

### Access the Application

1. Open browser: `http://localhost:5173`
2. You should see the ProjectCreate UI
3. Enter a project description (e.g., "Create a React todo app")
4. Click "Generate"
5. Wait for AI to process (30-60 seconds)
6. See generated project in the workspace

---

## Testing the Setup

### Test Scenario 1: Simple React App

**Input:** "Create a simple React counter application"

**Expected:**
- Backend processes in ~5-10 seconds
- Frontend displays file structure
- Code editor shows React component
- Preview shows working counter

### Test Scenario 2: Node.js Project

**Input:** "Create a Node.js Express server that serves static files"

**Expected:**
- Backend detects Node.js project
- Frontend displays package.json and server code
- Preview shows server running message

---

## Environment Variables Reference

### Backend .env

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| GEMINI_API_KEY | ✅ Yes | - | Your Google Gemini API key |
| PORT | No | 3000 | Port for backend server |
| NODE_ENV | No | development | Environment (development/production) |
| FRONTEND_URL | No | http://localhost:5173 | Frontend URL for CORS |

### Frontend config.ts

```typescript
export const BE_URL = "http://localhost:3000";
```

Change this if backend runs on different port/URL.

---

## Project Structure After Setup

```
ProjectCreate/
├── backend/
│   ├── node_modules/          # Installed dependencies
│   ├── dist/                  # Compiled TypeScript
│   ├── src/                   # Source code
│   ├── package.json
│   ├── .env                   # Your configuration (not in git)
│   ├── .env.example           # Template for .env
│   └── tsconfig.json
│
├── frontend/
│   ├── node_modules/          # Installed dependencies
│   ├── dist/                  # Built app (after build)
│   ├── src/                   # Source code
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── README.md
├── SETUP_GUIDE.md             # This file
└── DEPLOYMENT_FIX.md
```

---

## Troubleshooting

### Issue: "GEMINI_API_KEY is missing"

**Solution:**
1. Check if `.env` file exists in backend folder
2. Verify API key is correctly set
3. No spaces around `=` in .env file
4. Restart backend server

### Issue: "Cannot find module '@google/genai'"

**Solution:**
```bash
cd backend
npm install
npm run build
```

### Issue: "Port 3000 already in use"

**Solution - Option 1: Change backend port**
```bash
# Edit backend/.env
PORT=3001

# Update frontend/src/config.ts
export const BE_URL = "http://localhost:3001";
```

**Solution - Option 2: Kill process on port 3000**

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -i :3000
kill -9 <PID>
```

### Issue: CORS errors in browser console

**Solution:**
1. Ensure backend is running
2. Check `FRONTEND_URL` in backend .env matches actual URL
3. Restart both servers
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Failed to initialize project"

**Solutions:**
1. Check Gemini API key is valid
2. Verify internet connection
3. Check browser console for detailed error
4. Ensure backend is responding (`curl http://localhost:3000/health`)

### Issue: WebContainer not loading

**Solution:**
1. Use Chrome, Edge, or Safari (Firefox may have issues)
2. Ensure JavaScript is enabled
3. Check browser console for errors
4. Clear cache and reload

---

## Development Commands

### Backend

```bash
cd backend

# Start development server with auto-reload
npm run dev

# Compile TypeScript
npm run build

# Start compiled app
npm start
```

### Frontend

```bash
cd frontend

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Performance Optimization

### Backend Optimization
- Gemini 1.5 Flash is optimized for fast responses
- Typical response time: 5-15 seconds
- Larger projects may take 20-30 seconds

### Frontend Optimization
- Vite enables fast development builds
- Hot module replacement for instant updates
- Tree-shaking for optimized bundles

---

## Next Steps After Setup

1. **Customize System Prompts**: Edit `backend/src/prompts.ts`
2. **Add Project Templates**: Add to `backend/src/defaults/`
3. **Enhance UI**: Modify components in `frontend/src/components/`
4. **Deploy**: Follow deployment instructions in README.md

---

## Getting Help

### Check These First
- ✅ API key is valid
- ✅ Both servers are running
- ✅ No port conflicts
- ✅ Internet connection works
- ✅ Node.js version is 16+

### Debug Mode
1. Check backend logs during request
2. Open browser DevTools (F12)
3. Check Network tab for API calls
4. Check Console tab for JavaScript errors

---

## Useful Links

- [Gemini API Documentation](https://ai.google.dev/docs)
- [WebContainer API](https://webcontainer.io)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)

---

**Setup complete! Happy coding! 🚀**