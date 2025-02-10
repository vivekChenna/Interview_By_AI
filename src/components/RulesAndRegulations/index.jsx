import React from "react";

function RulesAndRegulations({ setStartInterview, isInterviewStarted }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-1/2 flex items-center flex-col md:gap-0 gap-5 justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Rules and Regulations
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          Please read the following rules carefully before starting the
          interview.
        </p>
      </div>
      <div className="md:w-1/2 w-11/12 min-h-80 rounded-2xl p-4 shadow-md border border-gray-300">
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            <b>Allow microphone and webcam access</b> to record your responses.
            Without it, your interview responses <b>cannot be captured</b>, and
            the session 
            <b className=" mx-1">will be invalid</b>.
          </li>
          <li className="mb-2">
            No other tab except the interview tab should access the{" "}
            <b>microphone or webcam</b>. Otherwise, you{" "}
            <b>will not be able to record</b> your responses, and your interview
            session <b>will be invalid</b>.
          </li>
          <li className="mb-2">
            <b>Do not switch tabs or minimize the browser</b> during the
            interview. Any tab switching{" "}
            <b>will result in warnings or disqualification</b>.
          </li>
          <li className="mb-2">
            Ensure your <b>webcam is turned on</b> throughout the interview.
            Turning it off <b>may lead to session termination</b>.
          </li>
          <li className="mb-2">
            Avoid using any <b>external devices, tools, or assistance</b> during
            the interview.
          </li>
          <li className="mb-2">
            Complete all questions within the <b>allotted time</b>. The session{" "}
            <b>will expire</b> after the time limit.
          </li>
          <li className="mb-2">
            Focus on the interview tab. Any{" "}
            <b>distractions or interruptions may result in termination</b>.
          </li>
          <li className="mb-2">
            <b>Unauthorized assistance or plagiarism</b> will result in{" "}
            <b>immediate disqualification</b>.
          </li>
          <li className="mb-2">
            Stay in <b>full-screen mode</b> throughout the interview.
            <b>Exiting full-screen mode</b> will <b>terminate the session</b>.
          </li>
        </ul>
      </div>

      <button
        onClick={() => setStartInterview()}
        className="mt-5 bg-black/90 py-2 px-4 text-white rounded-md active:scale-90 font-medium"
      >
        {isInterviewStarted ? "Loading..." : "Take a Demo Test"}
      </button>
    </div>
  );
}

export default RulesAndRegulations;
