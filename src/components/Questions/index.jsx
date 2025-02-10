import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import Webcam from "react-webcam";
import "regenerator-runtime/runtime";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { Context } from "../../context/context";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaPause } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import { generateReport, reviewSolutions } from "../../config/groq";
import RulesAndRegulations from "../RulesAndRegulations";
import { getQuestions } from "../../utils/questions";
import {
  AI_Engineer,
  Content_Specialist,
  Customer_Relations_Intern,
  Intern,
  Product_Management_Intern,
  UX_and_Interaction_Designer_Intern,
} from "../../constants/JobDescription";
import AudioWave from "../../utils/listening-motion";
import {
  saveUserQuestionAnswer,
  updateCandidateScoreAndLinkUsed,
  getCandidateDetails,
} from "../../constants/graphql";
import { formatTime } from "../../utils/timer";
import AudioDemo from "../AudioDemo";
import toast from "react-hot-toast";

const QuestionsPage = () => {
  const { jobRole, uniqueId } = useParams();
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const webcamRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const deepgramRef = useRef(null);
  const timerRef = useRef(null);
  const [startInterview, setStartInterview] = useState(false);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showSubmitBtn, setShowSubmitBtn] = useState(true);
  // const [showNextQuestionBtn, setShowNextQuestionBtn] = useState(false);
  const [showEndAndReview, setShowEndAndReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isInterviewStarted, SetIsInterviewStarted] = useState(false);
  const [savedTranscript, setSavedTranscript] = useState([]);
  const [isQuestionAndAnswerSaved, setIsQuestionAndAnswerSaved] =
    useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRedirected, SetIsRedirected] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAudioDemo, setShowAudioDemo] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [isQuestionSkipped, setIsQuestionSkipped] = useState(false);
  const {
    questions,
    jobDescription,
    setJobDescription,
    setQuestions,
    setUserPdfDetails,
  } = useContext(Context);

  useEffect(() => {
    const fetchQuestions = async () => {
      const myJobRole =
        jobRole === "AI Engineer"
          ? AI_Engineer
          : jobRole === "Customer Relations Intern"
          ? Customer_Relations_Intern
          : jobRole === "Product Management Intern"
          ? Product_Management_Intern
          : jobRole === "UX and Interaction Designer Intern"
          ? UX_and_Interaction_Designer_Intern
          : jobRole === "Intern"
          ? Intern
          : jobRole === "Content Specialist"
          ? Content_Specialist
          : "";

      try {
        const data = await getQuestions(myJobRole);
        setQuestions(data);
        setJobDescription(myJobRole);
      } catch (error) {}
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const initDeepgram = async () => {
      try {
        const deepgramClient = createClient(
          import.meta.env.VITE_DEEPGRAM_API_KEY
        );

        const connection = deepgramClient.listen.live({
          model: "nova-2",
          smart_format: true,
          language: "en",
          punctuate: true,
          interim_results: true,
        });

        connection.addListener(LiveTranscriptionEvents.Open, () => {
          console.log("Connection opened");
        });

        connection.addListener(LiveTranscriptionEvents.Error, (error) => {
          console.error("Deepgram error:", error);
        });

        connection.addListener(LiveTranscriptionEvents.Close, () => {
          console.log(
            "Deepgram connection closed unexpectedly. Attempting to reconnect..."
          );
          initDeepgram(); // Reconnect if closed unexpectedly
        });

        connection.addListener(LiveTranscriptionEvents.Transcript, (data) => {
          const transcription = data.channel.alternatives[0];

          console.log("Transcript received:", transcription);

          if (transcription.transcript) {
            if (data.is_final) {
              setTranscript(
                (prev) =>
                  prev + (prev ? " " : "") + transcription.transcript.trim()
              );
              setInterimTranscript("");
            } else {
              setInterimTranscript(transcription.transcript.trim());
            }
          }
        });

        deepgramRef.current = connection;
      } catch (error) {
        // console.error("Error initializing Deepgram:", error);
      }
    };

    initDeepgram();

    return () => {
      stopListening();
      if (deepgramRef.current) {
        deepgramRef.current?.removeAllListeners();
        deepgramRef.current?.finish();
        deepgramRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed >= 120) {
          setIsRecording(false);
          setShowSubmitBtn(true);
          setTimeLeft(120);
          muteCandidate();
        } else {
          setTimeLeft(elapsed);
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const {
    data,
    error,
    loading: waiting,
  } = useQuery(getCandidateDetails, {
    variables: {
      id: uniqueId,
    },
    onCompleted: (data) => {
      const expirationTime = new Date(data?.Candidate?.[0]?.link_expiration);
      setUserDetails(data?.Candidate?.[0]);
      setUserPdfDetails((prevState) => ({
        ...prevState,
        userName: data?.Candidate?.[0]?.name,
      }));
      const currentTime = new Date();

      if (data?.Candidate?.[0]?.is_link_used === true) {
        navigate("/error");
      }

      if (currentTime > expirationTime) {
        navigate("/error");
      }
    },
    onError: (error) => {},
  });

  useEffect(() => {
    if (index !== 0) {
      setIsRecording(true);
    }
  }, [index]);

  useEffect(() => {
    enableFullScreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // If the user exits fullscreen, re-enable it
        enableFullScreen();
      }
    };

    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // alert("You cannot switch tabs during the interview.");
        // window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const [saveQuestionAndAnswer] = useMutation(saveUserQuestionAnswer);
  const [updateUserScore] = useMutation(updateCandidateScoreAndLinkUsed);

  const startRecording = async () => {
    try {
      if (!deepgramRef.current) {
        throw new Error("Deepgram connection not initialized or not open");
      }

      // Step 1: Request access to both audio and video streams
      console.log("Requesting audio and video access...");
      const [audioStream, videoStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        navigator.mediaDevices.getUserMedia({ video: true }),
      ]);

      if (!audioStream) throw new Error("Failed to access microphone");
      if (!videoStream) throw new Error("Failed to access webcam");

      console.log("Microphone and webcam access granted");

      // Step 2: Store streams in refs to manage them across the component
      streamRef.current = audioStream;
      webcamRef.current = { stream: videoStream }; // Ensure webcamRef has the video stream

      // Step 3: Start audio recording
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm",
      });

      // Send recorded data to Deepgram for processing
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && deepgramRef.current) {
          deepgramRef.current.send(event.data);
        }
      };

      audioRecorder.start(500); // Send audio data every 500ms
      mediaRecorderRef.current = audioRecorder;

      console.log("Audio recording started.");

      // Step 4: Start video recording
      const videoRecorder = new MediaRecorder(videoStream, {
        mimeType: "video/webm",
      });

      videoRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prevChunks) => [...prevChunks, event.data]); // Store in state
        }
      });
      videoRecorder.start();

      videoRecorderRef.current = videoRecorder;

      console.log("Video recording started.");

      // Step 5: Perform UI updates
      enableFullScreen();
      setShowAudioDemo(true);
      setTranscript("");
      setInterimTranscript("");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Microphone or webcam access denied. Please allow access.");
    }
  };

  const stopListening = () => {
    console.log("Stopping all media and cleanup...");

    // Stop Audio Recording
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop Video Recording
    if (videoRecorderRef.current?.state === "recording") {
      videoRecorderRef.current.stop();
      videoRecorderRef.current = null;
    }

    // Stop all active media streams (microphone & webcam)
    [streamRef.current, webcamRef.current?.stream].forEach((stream) => {
      stream?.getTracks().forEach((track) => track.stop());
    });

    // Clear media stream references
    streamRef.current = null;
    webcamRef.current = null;

    // Stop any running timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    console.log("Media recording and streaming stopped.");
  };

  const enableFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {});
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const handleNextQuestion = () => {
    if (index < questions.length - 1) {
      unMuteCandidate();
      setIndex(index + 1);
      HandleRestart();
    }
  };

  const reviewInterviewer = async () => {
    try {
      setLoading(true);
      const data = await reviewSolutions(savedTranscript);
      const score = data?.choices[0]?.message?.content;
      await updateUserScore({
        variables: {
          id: uniqueId,
          user_score: score,
        },
      });
      const myReport = await generateReport(jobDescription, savedTranscript);
      const myReportData = myReport?.choices[0]?.message?.content;
      setUserPdfDetails((prevState) => ({
        ...prevState,
        pdfReport: myReportData,
        userScore: score,
      }));
      setLoading(false);
      SetIsRedirected(true);
      const response = await fetch(
        "https://app19.dev.andaihub.com/sendMail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userDetails,
            score: score,
          }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log("Email sent successfully:", result);
      } else {
        console.error("Error sending email:", result?.error);
      }

      SetIsRedirected(false);
      navigate("/complete");
    } catch (error) {
      console.log("error", error);
    }
  };

  const HandleRestart = () => {
    setIsRecording(false);
    setTimeLeft(0);
    setTranscript("");
    setInterimTranscript("");
    // setShowNextQuestionBtn(false);
    setShowSkipButton(true);
    setShowSubmitBtn(true);
  };

  const SubmitHandler = async () => {
    try {
      setErrorMsg("");
      setIsQuestionAndAnswerSaved(true);
      await saveQuestionAndAnswer({
        variables: {
          candidateId: uniqueId,
          question: questions[index]?.question,
          answer: transcript,
        },
      });

      setSavedTranscript((prev) => [
        ...prev,
        {
          question: questions[index]?.question,
          answer: transcript,
        },
      ]); // Save transcript for review

      if (index < questions.length - 1) {
        handleNextQuestion();
      }
      if (index === questions.length - 1) {
        setShowSubmitBtn(false);
        setShowEndAndReview(true);
      }
    } catch (error) {
      setErrorMsg("Internal Server Error, Please Click on Submit Once Again");
    }
    setIsQuestionAndAnswerSaved(false);
  };

  const muteCandidate = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = false;
    }
  };

  const unMuteCandidate = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = true;
    }
  };

  const skipQuestion = async () => {
    try {
      setIsQuestionSkipped(true);
      setShowSubmitBtn(false);
      muteCandidate();
      setIsRecording(false);
      await saveQuestionAndAnswer({
        variables: {
          candidateId: uniqueId,
          question: questions[index]?.question,
          answer: "",
        },
      });
      if (index === questions.length - 1) {
        setShowSkipButton(false);
        setShowEndAndReview(true);
      } else {
        handleNextQuestion();
      }
      setIsQuestionSkipped(false);
    } catch (error) {
      console.log('error', error);
    }
  };

  return !startInterview && !showAudioDemo ? (
    <RulesAndRegulations
      isInterviewStarted={isInterviewStarted}
      setStartInterview={async () => {
        SetIsInterviewStarted(true);
        await startRecording();
        SetIsInterviewStarted(false);
      }}
    />
  ) : showAudioDemo ? (
    <AudioDemo
      startCandidateInterview={() => {
        setShowAudioDemo(false);
        setStartInterview(true);
        setTranscript("");
        setInterimTranscript("");
        unMuteCandidate();
        setIsRecording(true);
      }}
      muteCandidate={muteCandidate}
      transcript={transcript}
      webcamRef={webcamRef}
      interimTranscript={interimTranscript}
      candidateId={uniqueId}
    />
  ) : (
    <div className=" flex flex-col items-center justify-center h-full ">
      <div className="w-1/2 flex items-center md:flex-row flex-col md:gap-0 gap-5 justify-between mb-8">
        <div
          className={
            " border border-gray-400 flex items-center rounded-3xl py-1 px-3"
          }
        >
          <button className=" flex items-center gap-2 text-sm md:text-[16px]">
            Question {index + 1} / 3
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full ">
        <div className=" md:w-1/2 w-11/12 min-h-80 rounded-2xl px-4 py-6 shadow-md border border-gray-300">
          <div>
            <p className=" text-black md:text-2xl text-lg text-center font-semibold select-none">
              {questions[index]?.question}
            </p>
          </div>
          <div className=" flex items-center justify-center mt-2">
            <p className=" text-gray-600 md:text-5xl text-2xl font-semibold ">
              {`${formatTime(timeLeft)}/2:00`}
            </p>
          </div>

          <div className=" flex items-center justify-center relative w-full gap-5">
            {/* {isRecording && (
              <div
                className="flex items-center justify-center mt-7 cursor-pointer"
                onClick={() => {
                  setIsRecording(false);
                  setShowSubmitBtn(true);
                  muteCandidate();
                  setShowSkipButton(false);
                }}
              >
                <div className=" border bg-red-600 p-4 flex items-center justify-center w-max rounded-full">
                  <FaPause color="white" fontSize="1.8rem" />
                </div>
              </div>
            )} */}

            {showSubmitBtn && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  disabled={isQuestionAndAnswerSaved}
                  className=" md:px-5 px-4 md:py-[8px] py-[3px] font-semibold rounded-lg text-white bg-blue-950 shadow-md text-lg "
                  onClick={() => {
                    setIsRecording(false);
                    muteCandidate();
                    setShowSkipButton(false);
                    SubmitHandler();
                  }}
                >
                  {isQuestionAndAnswerSaved
                    ? "Loading Next..."
                    : " Save And Next"}
                </button>
              </div>
            )}
            {showSkipButton && (
              <div className="flex items-center justify-center mt-8 gap-4">
                <button
                  disabled={isQuestionSkipped}
                  className=" md:px-5 px-4 md:py-[8px] py-[3px] font-semibold rounded-lg text-white bg-blue-950 shadow-md text-lg  justify-end items-end"
                  onClick={() => skipQuestion()}
                >
                  {isQuestionSkipped ? "Loading Next..." : " Skip"}
                </button>
              </div>
            )}
          </div>

          <div
            className={`absolute bottom-4 left-4 w-36 h-36 rounded-full overflow-hidden border-4 ${
              isRecording
                ? " border-red-500"
                : isQuestionAndAnswerSaved
                ? " border-green-500"
                : "border-white"
            } shadow-lg`}
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              mirrored={true}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute bottom-5 border h-[90px] p-5 w-max left-0 right-0 flex items-center justify-center mx-auto rounded-md  border-gray-300 z-50 bg-[#FFF8E3]">
            <AudioWave />
          </div>

          {/* {showNextQuestionBtn ? (
            <div className=" w-full flex items-center justify-center mt-6">
              <button
                className=" w-max md:px-5 px-4 py-2 drop-shadow-md rounded-lg text-lg scale-95 hover:scale-100 transition-all duration-300 bg-blue-950 text-white shadow-md"
                onClick={handleNextQuestion}
              >
                Next Question
              </button>
            </div>
          ) : null} */}
          {showEndAndReview && (
            <div className=" w-full flex items-center justify-center">
              <button
                className=" border-2 rounded-lg px-4 py-1 font-medium bg-red-100 text-red-900 text-sm md:text-xl flex items-center justify-center mt-6 hover:scale-105 transition-all ease-out duration-300"
                onClick={() => reviewInterviewer()}
                disabled={loading || isRedirected}
              >
                {loading
                  ? "Evaluating your responses..."
                  : isRedirected
                  ? "Redirecting you..."
                  : "End Interview"}
              </button>
            </div>
          )}

          <button
            className=" w-full flex items-center justify-between mt-10 border border-gray-300 rounded-md p-2.5 transition-all duration-300"
            onClick={() => {
              setShowTranscript(!showTranscript);
            }}
          >
            <p className=" font-medium text-sm">
              {!showTranscript ? "Show Transcript" : "Hide Transcript"}
            </p>
            {!showTranscript ? <FaAngleDown /> : <FaAngleUp />}
          </button>

          {showTranscript && (
            <div className=" mt-5 max-h-36 overflow-y-auto p-3">
              <p className="text-center">{transcript}</p>
              {interimTranscript && (
                <p className="text-gray-500 italic mt-7 text-center">
                  {interimTranscript}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className=" flex items-center justify-center mx-6 mb-2">
        <p className=" text-red-600 ">{errorMsg}</p>
      </div>
    </div>
  );
};

export default QuestionsPage;
