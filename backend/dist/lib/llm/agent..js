"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = handleChat;
const generative_ai_1 = require("@google/generative-ai");
const db_1 = require("../db");
// Initialize Gemini
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
function handleChat(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const Searchdb = (type, category) => __awaiter(this, void 0, void 0, function* () {
            const supporter = yield db_1.db.supporter.findMany({
                where: {
                    type,
                    category
                },
                select: {
                    name: true
                }
            });
            return supporter;
        });
        const tools = {
            Searchdb: Searchdb
        };
        const SYSTEM_PROMPT = `
        You are an AI assistant that searches for investors or mentors(lets collectively call them as supporters) from
        db as per the users prompt. Users are the founders that use my platform to
        get information about investors and mentors related to their fields.
        
        IMPORTANT: You must respond ONLY with valid JSON objects. Do not include any additional text or explanations.
        Each response must be a single JSON object with the following format:
        For planning: {"type": "plan", "plan": "your plan here"}
        For actions: {"type": "action", "function": "Searchdb", "input": {"type": "INVESTOR/MENTOR", "category": "category"}}
        For output: {"type": "output", "output": "your response here"}

        Available Tools:
        - Searchdb(type:(either MENTOR or INVESTOR), category: string): searches the db and returns matching supporters

        Example interaction (each line should be a single JSON object):
        {"type": "user", "user": "We are seeking investor to fuel company growth"}
        {"type": "plan", "plan": "I will try to get more context on what category the founder belongs to"}
        {"type": "output", "output": "Can you tell me what field your company belongs to?"}
        {"type": "user", "user": "We are a video OTT platform"}
        {"type": "plan", "plan": "I will search for an INVESTOR which belongs to Video category"}
        {"type": "action", "function": "Searchdb", "input": {"type": "INVESTOR", "category": "Video"}}
        {"type": "observation", "observation": "Martin"}
        {"type": "output", "output": "Martin is an investor which invests in video companies"}
    `;
        try {
            // Initialize the chat model
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            // Start the chat
            const chat = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: SYSTEM_PROMPT }],
                    }
                ],
            });
            const messages = [];
            const userMessage = {
                type: 'user',
                user: prompt
            };
            messages.push(userMessage);
            while (true) {
                // Send the current message
                const result = yield chat.sendMessage([
                    { text: JSON.stringify(messages[messages.length - 1]) }
                ]);
                const responseText = yield result.response.text();
                // Debug log
                console.log('Raw response:', responseText);
                try {
                    // Try to clean the response if needed
                    const cleanedResponse = responseText.trim()
                        .replace(/^```json\s*/, '')
                        .replace(/\s*```$/, '')
                        .replace(/^\s*\{/, '{')
                        .replace(/\}\s*$/, '}');
                    console.log('Cleaned response:', cleanedResponse);
                    const action = JSON.parse(cleanedResponse);
                    messages.push(action);
                    if (action.type === 'output') {
                        console.log('Final output:', action.output);
                        return action.output;
                    }
                    else if (action.type === 'action') {
                        const fn = tools[action.function];
                        if (!fn) {
                            throw new Error('Invalid Tool Call');
                        }
                        const observation = yield fn(action.input.type, action.input.category);
                        const observationMessage = {
                            type: 'observation',
                            observation: observation
                        };
                        messages.push(observationMessage);
                    }
                }
                catch (parseError) {
                    console.error('Parse error details:', parseError);
                    console.error('Problematic response:', responseText);
                    throw new Error(`Failed to parse AI response: `);
                }
            }
        }
        catch (e) {
            console.error('Chat error:', e);
            throw new Error("Failed to process chat");
        }
    });
}
