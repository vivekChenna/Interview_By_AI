import React from "react";

function RulesAndRegulations({ setStartInterview , isInterviewStarted }) {
  const rules = [
    "Allow microphone access to record your responses. Without it, your interview responses cannot be captured, and the session will be invalid.",
    "No other tab except the interview tab should access the microphone. Otherwise, you will not be able to record your responses, and your interview session will be invalid.",
    "Do not switch tabs or minimize the browser during the interview. Any tab switching will result in warnings or disqualification.",
    "Avoid using any external devices, tools, or assistance during the interview.",
    "Complete all questions within the allotted time. The session will expire after the time limit.",
    "Focus on the interview tab. Any distractions or interruptions may result in termination.",
    "Unauthorized assistance or plagiarism will result in immediate disqualification.",
    "Stay in full-screen mode throughout the interview. Exiting full-screen mode will terminate the session.",
    "Right-clicking and inspecting the webpage are strictly prohibited.",
  ];
  

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-1/2 flex items-center md:flex-row flex-col md:gap-0 gap-5 justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Rules and Regulations
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          Please read the following rules carefully before starting the interview.
        </p>
      </div>
      <div className="md:w-1/2 w-11/12 min-h-80 rounded-2xl p-4 shadow-md border border-gray-300">
        <ul className=" list-disc list-inside text-gray-700">
          {rules.map((rule, index) => (
            <li key={index} className="mb-2">
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setStartInterview()}
        className=" mt-5 bg-black/90 py-2 px-4 text-white rounded-md active:scale-90 font-medium"
      >
       {isInterviewStarted ? "Loading..." : " Start Interview"}
      </button>
    </div>
  );
}

export default RulesAndRegulations;
