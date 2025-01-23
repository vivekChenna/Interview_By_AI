import { getGroqChatCompletion } from "../config/groq";

export const getQuestions = async () => {  

  const data = await getGroqChatCompletion(`Job Description: AI Engineer
      Role Description:
This is an internship role for an Artificial Intelligence Engineer. The AI Engineer will be responsible for tasks such as pattern recognition, neural networks, software development, and natural language processing (NLP). This is a hybrid role allowing for some remote work.
Qualifications:
Pattern Recognition and Neural Networks skills
Computer Science and Software Development skills
Natural Language Processing (NLP) skills
Experience with AI algorithms and technologies
Strong programming skills in languages such as Python, Java, or C++
Bachelor's or Master's degree in Computer Science, Engineering, or related field
Experience with machine learning frameworks like TensorFlow or PyTorch
      `);

  const myQuestionData = data?.choices[0]?.message?.content;

  console.log('my question ' ,myQuestionData);
  

  return JSON.parse(myQuestionData);
};
