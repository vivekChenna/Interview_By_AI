import { getPayload } from "../constants/payload";
import { endPoints } from "../constants/endpoints";

export const getQuestions = async (job_description) => {
  const payload = getPayload(job_description);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": import.meta.env.VITE_OPENAI_API_KEY,
    },
    body: JSON.stringify(payload),
  };

  for (const endpoint of endPoints) {
    try {
      const response = await fetch(endpoint, requestOptions);

      if (response.ok) {
        const data = await response.json();
        const parsedContent = data?.choices?.[0]?.message?.content;
        return parsedContent ? JSON.parse(parsedContent) : null;
      }
    } catch (error) {
      console.log("error", error);
    }
  }
  throw new Error("Internal Server Error ,  Please try again later.");
};
