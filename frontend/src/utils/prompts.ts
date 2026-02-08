import { stripIndents } from './stripindents';


export const CODE_OUTPUT_INSTRUCTION = stripIndents`
  IMPORTANT: Do NOT use markdown code fences (\`\`\`) in your generated code files.
  Do NOT include language identifiers (like 'typescript', 'javascript', etc.) at the start or end.
  Provide clean, raw code content only.
`;

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Generate a complete prompt for initial project creation
 */
export function generateInitialPrompt(userPrompt: string): string {
  return stripIndents`
       
    ${CODE_OUTPUT_INSTRUCTION}
    
    USER REQUEST:
    ${userPrompt}
  `;
}





export const MODIFICATION_PROMPT = `
# INSTRUCTIONS FOR MODIFICATION
You are an expert developer modifying an existing project based on the user's request.

**CRITICAL RULES:**
1. ❌ **DO NOT** regenerate the entire project. Only output the files that need to be created or modified.
2. ❌ **DO NOT** use placeholders. The code must be fully complete and working.
3. ✅ **MAINTAIN** the existing folder structure and design system (Tailwind/Lucide).
4. ✅ **STRICTLY FOLLOW** the XML format for output:
   <boltAction type="file" filePath="path/to/file.tsx"> ...content... </boltAction>
5. ✅ **ALWAYS** use relative paths (../../) for imports. **NEVER** use aliases like (@/).
6. ✅ **PRESERVE** existing functionality unless explicitly asked to remove it.

**CONTEXT:**
The user has an existing Vite + React + Tailwind project.
You will receive their specific request below.
`;