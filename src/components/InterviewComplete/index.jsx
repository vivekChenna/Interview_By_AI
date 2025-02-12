import React from "react";

const InterviewComplete = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Your Interview is Over</h1>
        <p className="text-lg mb-4">Thank you for your time!</p>
        <p className="text-lg mb-6">Please Check your Mail.</p>
      </div>
    </div>
  );
};

export default InterviewComplete;
