# ProjectCreate API Documentation

## Overview

ProjectCreate Backend provides a RESTful API for AI-powered project generation. All requests and responses are in JSON format.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required. The API uses environment variables for API key management (Gemini).

## Endpoints

### 1. Health Check

Check if the backend is running.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "ProjectCreate Backend is running"
}
```

**Status Code:** `200`

---

### 2. Template Detection

Analyze user input and determine the project type (React or Node.js).

**Request:**
```http
POST /template
Content-Type: application/json

{
  "prompt": "Create a React todo application"
}
```

**Response (React):**
```json
{
  "prompt": [
    "base_prompt_text",
    "react_specific_prompt_text"
  ],
  "uiPrompt": "<boltArtifact>...</boltArtifact>"
}
```

**Response (Node.js):**
```json
{
  "prompt": [
    "base_prompt_text",
    "node_specific_prompt_text"
  ],
  "uiPrompt": "<boltArtifact>...</boltArtifact>"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid prompt or could not determine framework
- `500`: Server error

**Error Response:**
```json
{
  "error": "Could not determine framework. Response: ..."
}
```

---

### 3. Code Generation

Generate or refine project code based on user prompts.

**Request:**
```http
POST /chat
Content-Type: application/json

{
  "message": {
    "role": "user",
    "parts": [
      { "text": "base_prompt" },
      { "text": "framework_prompt" },
      { "text": "user_request" }
    ]
  }
}
```

**Response:**
```json
{
  "response": "<boltArtifact id=\"...\" title=\"...\"><boltAction type=\"file\" filePath=\"...\">...</boltAction></boltArtifact>"
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid message
- `500`: Gemini API error

**Error Response:**
```json
{
  "error": "Gemini API error: ..."
}
```

---

## Request Format Details

### Template Endpoint

**Required Fields:**
- `prompt` (string, required): The user's project description

**Validation:**
- Must be a non-empty string
- Minimum length: 1 character
- Maximum length: 5000 characters

### Chat Endpoint

**Required Fields:**
- `message` (object, required)
  - `role` (string): Always "user"
  - `parts` (array): Array of message parts
    - `text` (string): The actual content

**Validation:**
- Message must be provided
- Must follow the specified structure

---

## Response Format

### Success Response

All successful responses include:
- HTTP Status: `200`
- Content-Type: `application/json`
- Body: Response data as specified

### Error Response

All error responses include:
- HTTP Status: `4xx` or `5xx`
- Content-Type: `application/json`
- Body:
  ```json
  {
    "error": {
      "status": error_code,
      "message": "Error description",
      "details": {} // Optional, for validation errors
    }
  }
  ```

---

## Rate Limiting

Currently, no rate limiting is enforced. Production deployments should implement rate limiting based on:
- IP address
- API key (if authentication is added)
- Time window (requests per minute)

---

## CORS Configuration

The API accepts requests from:
- **Allowed Origins:** Configurable via `FRONTEND_URL` environment variable
- **Allowed Methods:** GET, POST, OPTIONS
- **Allowed Headers:** Content-Type
- **Credentials:** Supported

---

## Security Headers

All responses include:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## Response Times

- **Health Check:** < 10ms
- **Template Detection:** 2-5 seconds
- **Code Generation:** 10-30 seconds (depending on project size)

---

## Error Codes

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or validation failed |
| 500 | Internal Server Error | Server or API provider error |

---

## Request Examples

### Using cURL

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Template Detection:**
```bash
curl -X POST http://localhost:3000/template \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a React counter app"}'
```

**Code Generation:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "role": "user",
      "parts": [
        {"text": "base prompt"},
        {"text": "react prompt"},
        {"text": "Add dark mode support"}
      ]
    }
  }'
```

### Using JavaScript/Fetch

```javascript
// Template Detection
const response = await fetch('http://localhost:3000/template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Create a React todo app' })
});

const data = await response.json();
console.log(data);
```

### Using Axios

```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:3000/template', {
  prompt: 'Create a Node.js API server'
});

console.log(response.data);
```

---

## Logging

All requests are logged with the following information:
- Timestamp (ISO 8601 format)
- HTTP Method
- Request Path
- Response Status Code
- Response Time (ms)
- Client IP Address

Example Log:
```
[INFO] POST /chat - 200 (15234ms)
[ERROR] POST /template - 400 (245ms)
```

---

## Webhooks (Future)

Future versions may support webhooks for async code generation:
- POST to configured webhook URL
- Include generation status
- Send generated code when ready

---

## Versioning

Current API Version: **v1.0**

Future changes will maintain backward compatibility or provide migration paths.

---

## Support

For issues or questions:
1. Check endpoint documentation above
2. Review error messages
3. Check application logs
4. Verify environment configuration

---

**Last Updated:** February 2026
**API Status:** Production Ready