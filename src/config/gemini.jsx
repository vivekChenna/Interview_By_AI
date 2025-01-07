// node --version # Should be >= 18
// npm install @google/generative-ai

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = import.meta.env.VITE_API_KEY;

async function runChat(prompt, val, answer) {
  try {
    let newPrompt;
    if (val === 1) {
      newPrompt =
        "Attached is the interview question for reference: " +
        prompt +
        ". You'll find my response alongside." +
        answer +
        "provide strict feedback. Additionally, ensure the feedback directly relates to the question, and limit it to three lines, focusing solely on evaluating the provided answer.if the answer does not relates to the question and provides unnecessary things,then provide strict feedback.";

      // console.log(prompt);
    } else if (val == 2) {
      newPrompt =
        "Attached is the interview question for reference:" +
        prompt +
        "give me a proper answer for it in 3 lines.";
    } else {
      newPrompt =
        "I am attaching a job description based on a specific role. Act as interviewer and return me 5 questions in an array of objects as a json string which can be asked by the interviewer based on the job description. return me the 5 questions in an array of objects as a json string. do not write anything except array of objects as  json string. Now i am attaching the job description." +
        prompt;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const result = await chat.sendMessage(newPrompt);
    const response = result.response;

    const validString = response.text();

    if (val === 1 || val === 2) {
      // console.log(validString);
      return validString;
    } else {
      const startIndex = validString.indexOf("[");
      const endIndex = validString.lastIndexOf("]");

      // Extract the substring between startIndex and endIndex
      const jsonString = validString.substring(startIndex, endIndex + 1);

      const arrayOfObjects = JSON.parse(jsonString);

      // console.log(arrayOfObjects);
      return arrayOfObjects;
    }
  } catch (error) {
    throw new Error(error);
  }
}

export default runChat;
