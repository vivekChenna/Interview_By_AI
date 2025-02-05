import { getGroqChatCompletion } from "../config/groq";

export const getQuestions = async (job_description) => {  

  const data = await getGroqChatCompletion(job_description);

  const myQuestionData = data?.choices[0]?.message?.content;

  return JSON.parse(myQuestionData);
};
