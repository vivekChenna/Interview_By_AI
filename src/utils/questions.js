import { getPayload } from "../constants/payload";

export const getQuestions = async (job_description) => {

  const payload = getPayload(job_description);

  const response = await fetch(
    "https://ai-vdwivedi6332ai921470488247.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": import.meta.env.VITE_OPENAI_API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  return JSON.parse(data?.choices?.[0]?.message?.content);
};
