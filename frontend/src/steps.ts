import { Step, StepType } from './types/files';

export function parseXml(response: string): Step[] {
  // 1. Clean the response: Remove Markdown code blocks if present
  const cleanResponse = response.replace(/```xml/g, '').replace(/```/g, '');

  // 2. Extract the content inside <boltArtifact> tags
  const xmlMatch = cleanResponse.match(/<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/);
  
  if (!xmlMatch) {
    return [];
  }

  const xmlContent = xmlMatch[1];
  const steps: Step[] = [];
  let stepId = 1;

  // 3. Extract the project title
  const titleMatch = cleanResponse.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : 'Project';

  steps.push({
    id: stepId++,
    title: artifactTitle,
    description: 'Initialize project structure',
    type: StepType.CreateFolder,
    status: 'pending'
  });

  // 4. Parse individual <boltAction> elements
  // We utilize a loop to handle multiple actions
  const actionRegex = /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
  
  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;

    if (type === 'file') {
      // FIX: Clean up the content. 
      // The LLM often indents the code inside the XML tag. We need to strip that base indentation.
      const cleanCode = stripIndentation(content);

      steps.push({
        id: stepId++,
        title: `Create ${filePath}`,
        description: '',
        type: StepType.CreateFile,
        status: 'pending',
        code: cleanCode,
        path: filePath
      });
    } else if (type === 'shell') {
      steps.push({
        id: stepId++,
        title: 'Run Shell Command',
        description: '',
        type: StepType.RunScript,
        status: 'pending',
        code: content.trim()
      });
    }
  }

  return steps;
}

/**
 * Helper function to strip common leading whitespace from code blocks
 * caused by XML formatting.
 */
function stripIndentation(code: string): string {
  // Split into lines
  const lines = code.split('\n');
  
  // Remove initial empty lines
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  if (lines.length === 0) return '';

  // Determine the indentation of the first line
  const firstLineIndent = lines[0].match(/^\s*/)?.[0] || '';
  
  if (!firstLineIndent) return lines.join('\n');

  // Remove that indentation from all lines
  const cleanLines = lines.map(line => {
    if (line.startsWith(firstLineIndent)) {
      return line.substring(firstLineIndent.length);
    }
    return line;
  });

  return cleanLines.join('\n');
}