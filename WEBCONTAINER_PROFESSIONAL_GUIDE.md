# WebContainer Integration - Professional Implementation Guide

## Overview

This document outlines the professional implementation of WebContainer integration in the ProjectCreate application. It covers the complete lifecycle, architecture, and best practices for managing in-browser file systems and development environments.

## Architecture

### Component Hierarchy

```
Workspace (WorkspaceModern.tsx)
├── useWebContainer Hook
│   ├── Singleton WebContainer Instance
│   ├── Boot Management
│   └── API Wrapper
├── File Management
│   ├── File Tree Structure
│   ├── Mount System
│   └── File Operations
├── PreviewFrame Component
│   ├── npm install
│   ├── npm run dev
│   └── Server URL Detection
└── CodeEditor Component
```

## Core Features

### 1. useWebContainer Hook

The `useWebContainer` hook provides a clean, type-safe interface for interacting with WebContainer.

#### Key Features:
- **Singleton Pattern**: Prevents multiple WebContainer instances
- **Lazy Initialization**: Boots on first use
- **Error Handling**: Graceful error recovery
- **Type Safety**: Full TypeScript support

#### API Interface:

```typescript
interface WebContainerAPI {
  mount: (fileStructure: Record<string, any>) => Promise<void>;
  spawn: (command: string, args: string[], options?: any) => Promise<any>;
  fs: any;  // WebContainer filesystem API
  instance: WebContainer | null;
  isInitializing: boolean;
  error: string | null;
  isReady: boolean;
}
```

#### Usage Example:

```typescript
const webContainer = useWebContainer();

// Check if ready
if (webContainer.isReady) {
  // Mount files
  await webContainer.mount(fileStructure);
  
  // Execute commands
  const process = await webContainer.spawn('npm', ['install']);
  
  // Access filesystem
  const files = await webContainer.fs.readdir('/');
}
```

### 2. File Mounting System

#### Mount Structure Format:

```typescript
{
  "package.json": {
    file: {
      contents: "{ \"name\": \"my-app\" }"
    }
  },
  "src": {
    directory: {
      "App.tsx": {
        file: {
          contents: "export function App() { ... }"
        }
      }
    }
  }
}
```

#### Mounting Process:

1. **File Tree Creation**: Convert FileItem array to WebContainer mount structure
2. **Validation**: Verify critical files (package.json, index.html)
3. **Mount**: Async mount operation with error handling
4. **Confirmation**: Log successful mount for debugging

### 3. Preview System

The `PreviewFrame` component handles:

#### Phase 1: Verification
- Verify files are mounted
- Check for package.json
- Scan subdirectories if needed

#### Phase 2: Dependency Installation
```
npm install --legacy-peer-deps
```

#### Phase 3: Dev Server Startup
```
npm run dev
```

#### Phase 4: URL Detection
- Parse dev server output
- Extract localhost URL (e.g., `http://localhost:5173`)
- Display in iframe

#### Server URL Pattern:
```regex
(?:http:\/\/)?(?:localhost|127\.0\.0\.1):[\d]+
```

## TypeScript Error Resolution

### Problem
```
Property 'mount' does not exist on type '{ webContainer: WebContainer | null; 
isInitializing: boolean; error: string | null; isReady: boolean }'.ts(2339)
```

### Root Cause
The hook returned a generic object that didn't expose WebContainer methods directly.

### Solution
Enhanced the hook to:
1. Define a `WebContainerAPI` interface
2. Create wrapper methods for `mount` and `spawn`
3. Spread the API object into the return value
4. Add type safety throughout

### Before vs After

**Before (Problematic):**
```typescript
export function useWebContainer() {
  return {
    webContainer: webcontainer,  // Need webContainer.mount()
    isInitializing,
    error,
    isReady,
  };
}

// Usage (Error):
webContainer?.webContainer?.mount(structure)  // TS Error
```

**After (Professional):**
```typescript
export function useWebContainer() {
  const api: WebContainerAPI = {
    mount: async (fileStructure) => { ... },
    spawn: async (command, args, options) => { ... },
    fs: webcontainer?.fs,
    instance: webcontainer,
  };

  return {
    ...api,  // Direct access to methods
    isInitializing,
    error,
    isReady,
  };
}

// Usage (Clean):
await webContainer.mount(structure)  // ✓ Works
```

## Performance Optimizations

### 1. Singleton Pattern
```typescript
let webContainerInstance: WebContainer | null = null;
// Reuses same instance across component remounts
```

### 2. Boot Promise Caching
```typescript
let bootPromise: Promise<WebContainer> | null = null;
// Prevents multiple concurrent boot attempts
```

### 3. Server State Persistence
```typescript
let serverProcessRef: any = null;
let serverUrlRef: string | null = null;
let isServerStartedRef = false;
// Survives component remounts
```

### 4. Initialization Guards
```typescript
const initAttemptedRef = useRef(false);
// Prevents duplicate initialization
const hasInitiatedRef = useRef(false);
// Prevents duplicate preview starts
```

## Error Handling Strategy

### WebContainer Initialization Errors
```typescript
try {
  const instance = await getOrBootWebContainer();
  setWebContainer(instance);
} catch (err) {
  const errorMsg = err instanceof Error 
    ? err.message 
    : 'Failed to initialize WebContainer';
  setError(errorMsg);
}
```

### File Mounting Errors
```typescript
try {
  await webContainer.mount(mountStructure);
  console.log('Files mounted successfully');
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to mount files');
}
```

### Preview Startup Errors
```typescript
try {
  const dirContents = await webContainer.fs.readdir('/');
  // Verify package.json exists
  const hasPackageJson = // ...
  
  if (!hasPackageJson) {
    throw new Error('No package.json found');
  }
} catch (err) {
  setError(err instanceof Error ? err.message : 'Preview failed');
}
```

## Lifecycle Flow

### 1. Component Mount
```
WorkspaceModern mounts
└── useWebContainer() initializes
    └── WebContainer.boot() starts
        └── Instance stored in singleton
```

### 2. Files Generated
```
LLM generates files
└── parseXml() extracts steps
    └── FileItem[] created
        └── File state updated
```

### 3. Files Mounted
```
useEffect watches files
└── createMountStructure() builds format
    └── webContainer.mount() executes
        └── Files available in WebContainer
```

### 4. Preview Starts
```
activeTab changes to "preview"
└── PreviewFrame component renders
    └── startPreview() executes
        └── npm install runs
            └── npm run dev starts
                └── URL detected & displayed
```

## Best Practices

### 1. Always Check `isReady`
```typescript
if (webContainer?.isReady) {
  // Safe to use
  await webContainer.mount(files);
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  await operation();
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  setError(message);
  console.error('Operation failed:', err);
}
```

### 3. Use Async/Await
```typescript
// Good: Clear flow
const process = await webContainer.spawn('npm', ['install']);
const exitCode = await process.exit;

// Avoid: Promise hell
webContainer.spawn(...).then(p => p.exit.then(...))
```

### 4. Validate File Structure
```typescript
// Before mounting, ensure:
- package.json exists
- index.html exists (for web projects)
- src/ directory exists (if needed)
- vite.config.js exists (if Vite project)
```

### 5. Implement Timeouts
```typescript
const timeout = setTimeout(() => {
  if (!urlFound) {
    reject(new Error('Server startup timeout'));
  }
}, 45000);  // 45 second timeout
```

## Testing Checklist

- [ ] WebContainer initializes on first use
- [ ] Singleton prevents duplicate instances
- [ ] Files mount without errors
- [ ] npm install completes successfully
- [ ] Dev server starts and detects URL
- [ ] Preview displays in iframe
- [ ] Component survives remounts
- [ ] Error messages display clearly
- [ ] TypeScript compiles without errors

## Troubleshooting

### Issue: "WebContainer is not initialized"
**Solution**: Ensure `webContainer.isReady === true` before operations

### Issue: "No package.json found"
**Solution**: Verify LLM generated package.json in root or subdirectory

### Issue: "Server startup timeout"
**Solution**: Check project has valid `dev` script in package.json

### Issue: TypeScript errors
**Solution**: Use the updated `useWebContainer` hook with proper type checking

## Files Modified

1. **useWebContainer.ts** - Enhanced hook with WebContainerAPI interface
2. **WorkspaceModern.tsx** - Updated to use new hook API
3. **PreviewFrame.tsx** - Updated to use new hook API

## Future Enhancements

- [ ] Multi-file upload support
- [ ] File diff/merge capabilities
- [ ] Command execution history
- [ ] Environment variable management
- [ ] Project templates
- [ ] Collaborative editing support
- [ ] WebContainer workers for background tasks