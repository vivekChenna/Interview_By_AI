import {
  getGenerateReportPayload,
  getReviewSolutionsPayload,
} from "../constants/payload";


export const reviewSolutions = async (arrayOfObjects) => {
  const payload = getReviewSolutionsPayload(arrayOfObjects);

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

  return await response.json();

};

export const generateReport = async (jobDescription, arrayOfObjects) => {
  const payload = getGenerateReportPayload(jobDescription, arrayOfObjects);

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

  return await response.json();

};
