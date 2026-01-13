
import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse, Part, Content } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";
import type { Mode, ChatMessage, AttachedFile, SpecialistStatus, InteractionPrompt } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const taskParameter = { type: Type.OBJECT, properties: { task: { type: Type.STRING, description: "The specific sub-task to be performed." } }, required: ["task"] };

const specialistFunctions: FunctionDeclaration[] = [
    { name: 'delegateToArchitect', description: 'Delegates a task to the Architect AI for project planning.', parameters: taskParameter },
    { name: 'delegateToInstructor', description: 'Delegates a task to the Instructor AI for explaining concepts.', parameters: taskParameter },
    { name: 'delegateToRefactor', description: 'Delegates a task to the Refactor AI for improving code.', parameters: taskParameter },
    { name: 'delegateToDebugger', description: 'Delegates a task to the Debugger AI for finding bugs.', parameters: taskParameter },
    { name: 'delegateToLogic', description: 'Delegates a task to the Logic AI for algorithm design.', parameters: taskParameter },
    { name: 'delegateToSecurity', description: 'Delegates a task to the Security AI for vulnerability analysis.', parameters: taskParameter },
    { name: 'delegateToOptimizer', description: 'Delegates a task to the Optimizer AI for performance improvements.', parameters: taskParameter },
    { name: 'delegateToDocumenter', description: 'Delegates a task to the Documenter AI for writing documentation.', parameters: taskParameter },
];

const specialistMap: Record<string, Mode> = {
    'delegateToArchitect': 'build',
    'delegateToInstructor': 'learn',
    'delegateToRefactor': 'refactor',
    'delegateToDebugger': 'debug',
    'delegateToLogic': 'logic',
    'delegateToSecurity': 'security',
    'delegateToOptimizer': 'optimizer',
    'delegateToDocumenter': 'documenter',
};


const convertMessagesToHistory = (messages: ChatMessage[] | null): Content[] => {
    if (!messages) return [];

    let historyToConvert = messages;

    if (historyToConvert.length > 0 && historyToConvert[0].sender === 'model' && historyToConvert[0].content.startsWith('Welcome')) {
        historyToConvert = historyToConvert.slice(1);
    }
    
    return historyToConvert.map(msg => ({
        role: msg.sender,
        parts: [{ text: msg.content }]
    })).filter(item => item.parts[0].text);
};

export function startChatSession(systemInstruction: string, mode: Mode, history: ChatMessage[] | null): Chat {
  let tools;
  if (mode === 'squad') {
    tools = [{ functionDeclarations: specialistFunctions }];
  } else if (mode === 'academic') {
    tools = [{ googleSearch: {} }];
  }
  
  const geminiHistory = convertMessagesToHistory(history);

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: geminiHistory,
    config: {
      systemInstruction: systemInstruction,
      tools: tools
    }
  });
  return chat;
}

async function callSpecialist(mode: Mode, task: string): Promise<string> {
    const specialistAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const specialistChat = specialistAI.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction: SYSTEM_INSTRUCTIONS[mode] }
    });
    const result = await specialistChat.sendMessage({ message: task });
    return result.text ?? "No response from specialist.";
}

interface ProjectContext {
    type: string;
    files: string[];
}

const detectProjectType = (files: AttachedFile[]): ProjectContext | null => {
    const filenames = files.map(f => f.name.toLowerCase());
    if (filenames.includes('package.json')) return { type: 'Node.js', files: filenames };
    if (filenames.some(name => name === 'requirements.txt' || name === 'pyproject.toml')) return { type: 'Python', files: filenames };
    if (filenames.includes('pom.xml') || filenames.some(name => name.endsWith('.gradle'))) return { type: 'Java', files: filenames };
    if (filenames.includes('gemfile')) return { type: 'Ruby', files: filenames };
    if (filenames.includes('go.mod')) return { type: 'Go', files: filenames };
    if (filenames.includes('cargo.toml')) return { type: 'Rust', files: filenames };
    return null;
};

export async function* sendMessage(chat: Chat, message: string, files: AttachedFile[] = [], onSpecialistStatusChange?: (specialist: Mode, status: SpecialistStatus) => void, mode?: Mode): AsyncGenerator<{ textChunk?: string; interaction?: InteractionPrompt }> {
    const messageParts: Part[] = [];
    const binaryFileNames: string[] = [];
    const readableFileNames: string[] = [];
    const BINARY_EXTENSIONS = ['.dll', '.zip', '.rar', '.7z', '.tar.gz', '.tgz', '.gz', '.tar'];

    for (const file of files) {
        const isBinary = BINARY_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
        if (isBinary) {
            binaryFileNames.push(file.name);
        } else {
            readableFileNames.push(file.name);
            messageParts.push({
                inlineData: {
                    mimeType: file.type,
                    data: file.content
                }
            });
        }
    }
    
    let textPrompt = message;

    if (files.length > 0) {
        const projectContext = detectProjectType(files);
        let filePreamble = '';

        if (mode === 'squad') {
            let context = "You have been provided with a set of files.";
            if (projectContext) {
                context = `You have been provided with what appears to be a ${projectContext.type} project.`;
            }
            
            if (readableFileNames.length > 0) {
                context += `\nReadable files: [${readableFileNames.join(', ')}].`;
            }
            if (binaryFileNames.length > 0) {
                context += `\nUnreadable archives/binaries: [${binaryFileNames.join(', ')}]. You must infer their contents from the filenames.`;
            }

            filePreamble = `**Project Context:**\n${context}\n\nYour primary task is to analyze this context and the user's request, then formulate a comprehensive plan. Delegate specific analysis, coding, and documentation tasks to your specialists based on the file contents and project type.`;
            textPrompt = `${filePreamble}\n\n---\n\n**User's Request:** ${message}`;

        } else {
            let readablePreamble = '';
            let binaryPreamble = '';
            if (readableFileNames.length > 0) {
                readablePreamble = `The user has attached the following files which you can read: [${readableFileNames.join(', ')}]. Use their content as primary context.`;
            }
            if (binaryFileNames.length > 0) {
                binaryPreamble = `The user has also attached these binary files which you CANNOT read: [${binaryFileNames.join(', ')}]. Acknowledge their presence and use their filenames for context.`;
            }
            filePreamble = [readablePreamble, binaryPreamble].filter(Boolean).join('\n');
            textPrompt = `**Attached Files Context:**\n${filePreamble}\n\n---\n\n**User's Prompt:** ${message}`;
        }
    }
    
    if (textPrompt) {
        messageParts.push({ text: textPrompt });
    }

    let stream = await chat.sendMessageStream({ message: messageParts });
    let shouldContinue = true;

    while (shouldContinue) {
        shouldContinue = false;
        const functionCalls: { name: string; args: any; id: string }[] = [];
        let textBuffer = '';
        const interactionRegex = /\[PAUSE_INTERACTION:\s*"([^"]+)"\]/;

        for await (const chunk of stream) {
            if (chunk.functionCalls) {
                functionCalls.push(...chunk.functionCalls);
            }
            
            const chunkText = chunk.text;
            if (chunkText) {
                textBuffer += chunkText;
                const match = textBuffer.match(interactionRegex);

                if (match) {
                    const textBeforeTag = textBuffer.substring(0, match.index);
                    const prompt = match[1];
                    
                    if (textBeforeTag) {
                        yield { textChunk: textBeforeTag };
                    }
                    
                    yield { interaction: { prompt } };
                    // Stop this turn after issuing an interaction prompt
                    return; 
                } else {
                    yield { textChunk: chunkText };
                }
            }
        }
        
        if (functionCalls.length > 0) {
            const specialistPromises = functionCalls.map(call => {
                return (async () => {
                    const specialistMode = specialistMap[call.name];
                    if (specialistMode) {
                        onSpecialistStatusChange?.(specialistMode, 'working');
                        try {
                            const specialistResponse = await callSpecialist(specialistMode, call.args.task);
                            onSpecialistStatusChange?.(specialistMode, 'complete');
                            return {
                                functionResponse: {
                                    name: call.name,
                                    response: { result: specialistResponse },
                                },
                            };
                        } catch (e) {
                            console.error(`Error calling specialist ${specialistMode}`, e);
                            onSpecialistStatusChange?.(specialistMode, 'error');
                            return {
                                functionResponse: {
                                    name: call.name,
                                    response: { result: "Specialist AI encountered an error." },
                                },
                            };
                        }
                    }
                    return null;
                })();
            });

            const results = await Promise.all(specialistPromises);
            const functionResponses = results.filter(Boolean) as Part[];

            if(functionResponses.length > 0) {
                stream = await chat.sendMessageStream({ message: functionResponses });
                shouldContinue = true;
            }
        }
    }
}
