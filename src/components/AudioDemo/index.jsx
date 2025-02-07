import React, { useState, useEffect, useRef } from "react";
import { FaPause } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import { formatTime } from "../../utils/timer";
import toast from "react-hot-toast";
import { updateTranscriptionWorking } from "../../constants/graphql";
import { useMutation } from "@apollo/client";
import Webcam from "react-webcam";

const AudioDemo = ({
  transcript,
  interimTranscript,
  candidateId,
  webcamRef,
  startVideoRecording,
  startCandidateInterview,
  muteCandidate,
}) => {
  const demoQuestion =
    "Can you describe a challenging situation you faced at work and how you handled it?";
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [transcriptWorking, setTranscriptWorking] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const [updateTranscription] = useMutation(updateTranscriptionWorking);
  const [startRealInterview, setStartRealInterview] = useState(false);
  const [showReloadingText, setShowReloadingText] = useState(false);

  useEffect(() => {
    if (isRunning && timeLeft < 120) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime < 120 ? prevTime + 1 : 120));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  const handlePause = () => {
    setIsRunning(false);
    muteCandidate();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!transcriptWorking) {
      toast.error("Please select an option");
      return;
    }

    const isWorking = Boolean(transcriptWorking === "Yes");

    try {
      setLoading(true);

      await updateTranscription({
        variables: {
          id: candidateId,
          isWorking,
        },
      });

      if (isWorking === false) {
        setShowReloadingText(true);
      } else {
        setStartRealInterview(true);
      }
    } catch (error) {
      console.log("error", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full ">
      <p className=" text-lg mb-2">
        Please Answer The Below Question And Click on Pause Button
      </p>
      <p className=" text-sm mb-4">
        {" "}
        <strong>Note:</strong> This question is for testing purpose only
      </p>
      <div className="md:w-1/2 w-11/12 min-h-80 rounded-2xl px-4 py-6 shadow-md border border-gray-300">
        <p className="text-black md:text-2xl text-lg text-center font-semibold select-none">
          {demoQuestion}
        </p>
        <div className="flex items-center justify-center mt-2">
          <p className="text-gray-600 md:text-5xl text-2xl font-semibold">
            {`${formatTime(timeLeft)}/2:00`}
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center justify-center mt-4">
            <button
              className="w-full flex items-center justify-center mt-7 cursor-pointer"
              onClick={handlePause}
            >
              <div className="border bg-red-600 p-4 flex items-center justify-center w-max rounded-full">
                <FaPause color="white" fontSize="1.8rem" />
              </div>
            </button>
          </div>
        )}
        <div className="mt-5 max-h-40 overflow-y-auto p-3">
          <p className="text-center">{transcript}</p>
          {interimTranscript && (
            <p className="text-gray-500 italic mt-7 text-center">
              {interimTranscript}
            </p>
          )}
        </div>

        {/* Transcript Working Question */}
      </div>

      {!isRunning && !startRealInterview && (
        <form onSubmit={handleSubmit} className="mt-6">
          <p className="text-lg font-semibold text-center">
            Was the transcript working correctly?
          </p>
          <div className="relative mt-2">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-black/70 focus:border-black/70 cursor-pointer appearance-none"
              value={transcriptWorking}
              onChange={(e) => setTranscriptWorking(e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <FaAngleDown className="text-gray-500" />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black/90 text-white py-3 mt-4 rounded-lg hover:bg-black/80 transition duration-300"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

      {startRealInterview && (
        <div className="p-4 text-center mt-6 md:w-1/2 w-11/12">
          <h2 className="text-xl font-semibold text-gray-800">
            Thank you for submitting!
          </h2>
          <p className="text-gray-700 mt-2">Your demo test is completed.</p>
          <p className="text-gray-700 mt-1">
            Now, let's begin the real interview.
          </p>
          <p className="text-gray-700 mt-1">Click the button below to start.</p>
          <button
            onClick={() => startCandidateInterview()}
            className="mt-4 px-6 py-2 bg-black/90 text-white font-medium rounded-md hover:bg-black/70 transition duration-300"
          >
            Start Interview
          </button>
        </div>
      )}

      {showReloadingText && (
        <div className="p-4 text-center mt-6 md:w-1/2 w-11/12 ">
          <div className="">
            <h2 className="text-xl font-semibold text-gray-800">
              Thank you for your submission!
            </h2>
            <p className=" text-gray-600 text-lg leading-6 mt-1">
              If your transcription isn't working, please try reloading the
              page.
            </p>
          </div>
        </div>
      )}

      <div className={`absolute bottom-4 left-4 w-36 h-36 rounded-full overflow-hidden border-4 ${isRunning?" border-red-500":"border-white"} shadow-lg`}>
        <Webcam
          audio={false}
          ref={webcamRef}
          mirrored={true}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
          onUserMedia={(stream) => {
            startVideoRecording();
          }}
        />
      </div>
    </div>
  );
};

export default AudioDemo;
