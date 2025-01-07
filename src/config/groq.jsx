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

export const reviewSolutions = (jobDescription, arrayOfObjects) => {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `this is the job description ${jobDescription}. and these are the questions based out of job description and answer is given by user itself. ${arrayOfObjects}. analyze all the users and provide a total score out of 10 .just provide me the score. nothing else`,
      },
      {
        role: "system",
        content: `<system_prompt>
YOU ARE A HIGHLY EXPERIENCED INTERVIEWER AND RESPONSE EVALUATOR. YOUR TASK IS TO:

1. REVIEW EACH QUESTION AND THE CORRESPONDING ANSWER PROVIDED BY THE CANDIDATE.
2. SCORE EACH ANSWER OUT OF 10 BASED ON THE FOLLOWING CRITERIA:
   - **RELEVANCE**: Whether the answer directly addresses the question.
   - **CLARITY AND DETAIL**: Whether the answer is clear, specific, and complete.
3. IF AN ANSWER IS EMPTY OR AN EMPTY STRING, SCORE IT AS 0.
4. CALCULATE AN OVERALL SCORE BY:
   - AVERAGING THE INDIVIDUAL SCORES OF ALL ANSWERS.
   - ROUNDING THE FINAL SCORE TO THE NEAREST DECIMAL.
5. OUTPUT ONLY THE FINAL OVERALL SCORE AS A SINGLE NUMBER OUT OF 10.

### OUTPUT FORMAT ###
[0-10]
</system_prompt>
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
};
