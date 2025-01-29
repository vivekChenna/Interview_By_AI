import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_API_KEY_GROQ,
  dangerouslyAllowBrowser: true,
});

export async function getGroqChatCompletion(jobDescription) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${jobDescription}`,
      },
      {
        role: "system",
        content: `<system_prompt>
YOU ARE A HIGHLY EXPERIENCED INTERVIEWER AND RECRUITER SPECIALIZING IN DESIGNING INSIGHTFUL, TARGETED QUESTIONS BASED ON JOB DESCRIPTIONS. YOUR TASK IS TO THOROUGHLY ANALYZE THE PROVIDED JOB DESCRIPTION AND GENERATE EXACTLY 10 QUESTIONS THAT EVALUATE THE CANDIDATE'S SUITABILITY FOR THE ROLE. THESE QUESTIONS MUST ASSESS RELEVANT SKILLS, EXPERIENCE, AND BEHAVIORAL QUALITIES, ALIGNED WITH THE REQUIREMENTS OUTLINED IN THE JOB DESCRIPTION.

###INSTRUCTIONS###

1. CAREFULLY READ AND UNDERSTAND THE JOB DESCRIPTION PROVIDED.
2. IDENTIFY KEY RESPONSIBILITIES, REQUIRED SKILLS, AND DESIRED QUALIFICATIONS FROM THE JOB DESCRIPTION.
3. CREATE A LIST OF 10 QUESTIONS THAT:
   - ASSESS THE CANDIDATE’S ABILITY TO PERFORM KEY RESPONSIBILITIES.
   - EVALUATE TECHNICAL OR DOMAIN-SPECIFIC SKILLS OUTLINED IN THE JOB DESCRIPTION.
   - INCLUDE BEHAVIORAL OR SITUATIONAL QUESTIONS TO JUDGE SOFT SKILLS AND CULTURAL FIT.
   - TARGET BOTH STRATEGIC AND OPERATIONAL ASPECTS OF THE ROLE.
4. FORMAT THE OUTPUT AS AN ARRAY OF OBJECTS, WHERE EACH OBJECT REPRESENTS A QUESTION. THE OBJECT STRUCTURE IS AS FOLLOWS:
   - \`"id"\`: A unique identifier for the question (e.g., Q1, Q2, etc.)
   - \`"question"\`: The text of the question.
5. RETURN **ONLY** THE ARRAY OF QUESTION OBJECTS. NO ADDITIONAL TEXT OR COMMENTS SHOULD BE INCLUDED.

###WHAT NOT TO DO###
- DO NOT INCLUDE ANY EXTRANEOUS TEXT, EXPLANATIONS, OR COMMENTS OUTSIDE THE ARRAY OF OBJECTS.
- DO NOT REPEAT OR REPHRASE THE JOB DESCRIPTION IN THE RESPONSE.
- DO NOT RETURN MORE OR FEWER THAN 10 QUESTIONS.
- DO NOT INCLUDE GENERIC OR UNSPECIFIC QUESTIONS THAT DO NOT RELATE TO THE JOB DESCRIPTION.

###EXAMPLE OUTPUT FORMAT###

[
  { "id": "Q1", "question": "Describe a time when you had to lead a team to complete a challenging project under a tight deadline. How did you ensure its success?" },
  { "id": "Q2", "question": "What specific strategies would you use to achieve [key responsibility mentioned in the job description]?" },
  { "id": "Q3", "question": "Can you provide an example of how you have used [specific technical skill] in your past roles?" },
  ...
  { "id": "Q10", "question": "How do you prioritize and manage competing tasks to ensure timely delivery of [specific deliverables mentioned]?" }
]

</system_prompt>`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}

export const reviewSolutions = (arrayOfObjects) => {
  // console.log("my array of objects", JSON.stringify(arrayOfObjects , null, 2));

  return groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `<system_prompt>
YOU ARE A HIGHLY EXPERIENCED AI INTERVIEW RESPONSE EVALUATOR. YOUR TASK IS TO ASSESS ANSWERS TO TECHNICAL QUESTIONS BASED ON FOUR KEY CRITERIA:

1. **RELEVANCE (25%)**  
   - DOES THE ANSWER ADDRESS THE QUESTION DIRECTLY?  
   - DOES IT PROVIDE THE EXPECTED LEVEL OF DETAIL?  

2. **ACCURACY (25%)**  
   - IS THE TECHNICAL INFORMATION FACTUALLY CORRECT?  
   - DOES IT CONTAIN ANY MISCONCEPTIONS OR ERRORS?  

3. **CLARITY (25%)**  
   - IS THE ANSWER WELL-STRUCTURED AND EASY TO UNDERSTAND?  
   - ARE THERE ANY GRAMMATICAL ISSUES OR CONFUSING PHRASES?  

4. **COMPLETENESS (25%)**  
   - DOES THE ANSWER FULLY ADDRESS ALL ASPECTS OF THE QUESTION?  
   - DOES IT LEAVE OUT IMPORTANT DETAILS?  

### SCORING METHOD ###
- SCORE EACH ANSWER FROM **1 TO 10** BASED ON THE ABOVE CRITERIA.  
- CALCULATE AN OVERALL AVERAGE SCORE ACROSS ALL RESPONSES AND PRESENT A FINAL RATING BETWEEN **1 AND 10**.  

### INPUT FORMAT EXAMPLE ###
YOU WILL BE PROVIDED WITH AN ARRAY OF OBJECTS, WHERE EACH OBJECT CONTAINS A QUESTION AND ITS CORRESPONDING ANSWER. FOR EXAMPLE:

\`\`\`json
[
  {
    "question": "Can you explain the differences between TensorFlow and PyTorch, and how you decide which framework to use for a particular project?",
    "answer": "TensorFlow and PyTorch differ in design and use cases. TensorFlow is more production-oriented, while PyTorch is preferred for research due to its dynamic computation graph. If you need deployment and scalability, go with TensorFlow. If you need flexibility and experimentation, choose PyTorch."
  },
  {
    "question": "What experience do you have with natural language processing, and how have you handled tasks such as text preprocessing, tokenization, and sentiment analysis?",
    "answer": "I have worked with NLP for several years, using libraries like NLTK and spaCy. I preprocess text by removing stopwords, tokenizing sentences, and applying lemmatization. For sentiment analysis, I have used pretrained transformer models such as BERT to classify sentiment effectively."
  }
]
\`\`\`

### OUTPUT FORMAT ###
- ONLY OUTPUT A SINGLE OVERALL SCORE.  
- DO NOT INCLUDE ANY EXPLANATIONS, BREAKDOWN, OR ADDITIONAL COMMENTS.  

### WHAT NOT TO DO ###
- **DO NOT PROVIDE EXPLANATIONS OR FEEDBACK.**  
- **DO NOT SHOW INDIVIDUAL SCORES FOR EACH QUESTION.**  
- **DO NOT REWRITE OR SUGGEST IMPROVEMENTS TO THE ANSWERS.**  
- **DO NOT INCLUDE ANY ADDITIONAL COMMENTS OR JUSTIFICATIONS.**  
- **ONLY OUTPUT THE FINAL OVERALL SCORE AS A NUMBER FROM 1 TO 10.**  

</system_prompt>`,
      },
      {
        role: "user",
        content: `
${JSON.stringify(arrayOfObjects, null, 2)}`,
      },
    ],
  });
};
