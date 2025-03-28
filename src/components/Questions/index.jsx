import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { useMutation, useQuery } from "@apollo/client";
import Webcam from "react-webcam";
import "regenerator-runtime/runtime";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { Context } from "../../context/context";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaPause } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import RulesAndRegulations from "../RulesAndRegulations";
import { getQuestions } from "../../utils/questions";

import AudioWave from "../../utils/listening-motion";
// import {
//   saveUserQuestionAnswer,
//   updateCandidateStatusAndLinkUsed,
// } from "../../constants/graphql";
import { formatTime } from "../../utils/timer";
import AudioDemo from "../AudioDemo";
import toast from "react-hot-toast";
import { sanitizeName } from "../../utils/name-sanitization";

const QuestionsPage = () => {
  const { jobRole, uniqueId, userName, clientId } = useParams();
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
  const [showEndAndReview, setShowEndAndReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isInterviewStarted, SetIsInterviewStarted] = useState(false);
  const [isQuestionAndAnswerSaved, setIsQuestionAndAnswerSaved] =
    useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAudioDemo, setShowAudioDemo] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [isQuestionSkipped, setIsQuestionSkipped] = useState(false);
  const { questions, setJobDescription, setQuestions } = useContext(Context);
  const [uploadId, setUploadId] = useState(null);
  const [fileKey, setFileKey] = useState(null);
  const uploadedParts = useRef([]);
  const isUploading = useRef(true);

  useEffect(() => {
    getInterviewCandidateDetails();
  }, []);

  const getInterviewCandidateDetails = async () => {
    try {
      const endpoint = `https://hrbotbackend.dev.andaihub.com/api/candidates?id=${uniqueId}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      console.log("data.data", data.data);

      setUserDetails(data?.data);

      const expirationTime = new Date(data?.data?.linkExpiration);
      const currentTime = new Date();

      if (data?.data?.isLinkUsed === true) {
        navigate("/error");
      }

      if (currentTime > expirationTime) {
        navigate("/error");
      }
    } catch (error) {}
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const myJobRole = userDetails?.job?.description;

      try {
        const data = await getQuestions(myJobRole);
        if (data) {
          setQuestions(data);
        } else {
          toast.error(
            "Internal Server Error, please wait for sometime and try reloading the page "
          );
        }
        setJobDescription(myJobRole);
      } catch (error) {
        toast.error(
          "Internal Server Error, please wait for sometime and try reloading the page "
        );
      }
    };

    if (userDetails !== null) {
      fetchQuestions();
    }
  }, [userDetails]);

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
          setShowSkipButton(false);
          setTimeLeft(120);
          muteCandidate();
        } else {
          setTimeLeft(elapsed);
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // const {
  //   data,
  //   error,
  //   loading: waiting,
  // } = useQuery(getCandidateDetails, {
  //   variables: {
  //     id: uniqueId,
  //   },
  //   onCompleted: (data) => {
  //     const expirationTime = new Date(data?.Candidate?.[0]?.link_expiration);
  //     setUserDetails(data?.Candidate?.[0]);
  //     const currentTime = new Date();

  //     if (data?.Candidate?.[0]?.is_link_used === true) {
  //       navigate("/error");
  //     }

  //     if (currentTime > expirationTime) {
  //       navigate("/error");
  //     }
  //   },
  //   onError: (error) => {},
  // });

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
        toast.error("do not switch tabs during the interview");
        // alert("You cannot switch tabs during the interview.");
        // window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // const [saveQuestionAndAnswer] = useMutation(saveUserQuestionAnswer);
  // const [updateCandidateLinkAndStatus] = useMutation(
  //   updateCandidateStatusAndLinkUsed
  // );

  const startRecording = async () => {
    try {
      if (!deepgramRef.current) {
        throw new Error("Deepgram connection not initialized or not open");
      }

      // Step 1: Request access to both audio and video streams
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

      const sanitizedUserName = sanitizeName(userName);

      const response = await fetch(
        "https://app22.dev.andaihub.com/api/start-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: sanitizedUserName,
          }),
        }
      );
      const data = await response.json();

      setUploadId(data?.uploadId);
      setFileKey(data?.fileKey);

      let partNumber = 1;

      videoRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const chunkBlob = new Blob([event.data], { type: "video/webm" });

          const currentPartNumber = partNumber;
          partNumber++;

          await uploadChunkToS3(
            chunkBlob,
            currentPartNumber,
            data?.uploadId,
            data?.fileKey
          );
        }
      };
      videoRecorder.start(60000);

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

  const completeUpload = async () => {
    try {
      const response = await fetch(
        "https://app22.dev.andaihub.com/api/complete-upload",
        {
          method: "POST",
          body: JSON.stringify({
            uploadId,
            fileKey,
            parts: uploadedParts.current,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
    } catch (error) {
      console.error("Error completing upload:", error);
      toast.error("Upload finalization failed.");
    }
  };

  const uploadChunkToS3 = async (chunkBlob, partNumber, uploadId, fileKey) => {
    try {
      if (!isUploading.current) {
        console.warn(
          `Skipping upload for chunk ${partNumber} (recording stopped)`
        );
        return;
      }

      const response = await fetch(
        `https://app22.dev.andaihub.com/api/get-presigned-url?uploadId=${uploadId}&fileKey=${fileKey}&partNumber=${partNumber}`
      );
      const { signedUrl } = await response.json();

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: chunkBlob,
      });

      if (uploadResponse.ok) {
        const etag = uploadResponse.headers.get("ETag");

        uploadedParts.current.push({
          ETag: etag,
          PartNumber: partNumber,
        });
      } else {
        console.error(`Failed to upload chunk ${partNumber}`);
      }
    } catch (error) {
      console.error("Error uploading chunk:", error);
    }
  };

  const stopListening = async () => {
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

    isUploading.current = false;
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
      stopListening();
      await completeUpload();
      // await updateCandidateLinkAndStatus({
      //   variables: {
      //     id: uniqueId,
      //     status: "pending",
      //   },
      // });

      const response = await fetch(
        `https://hrbotbackend.dev.andaihub.com/api/candidate/updatelinkandstatus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: uniqueId,
            status: "pending",
            isLinkUsed: true,
          }),
        }
      );

      await sendEmail({ ...userDetails });

      setLoading(false);
      navigate("/complete");
    } catch (error) {
      setLoading(false);
      toast.error("something went wrong");
      console.log("error", error);
    }
  };

  const sendEmail = async (data) => {
    const response = await fetch(
      "https://app19.dev.andaihub.com/interviewCompletion",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error sending email: ${errorData?.error}`);
    }
  };

  const HandleRestart = () => {
    setIsRecording(false);
    setTimeLeft(0);
    setTranscript("");
    setInterimTranscript("");
    setShowSkipButton(true);
    setShowSubmitBtn(true);
  };

  const SubmitHandler = async () => {
    try {
      setErrorMsg("");
      setIsQuestionAndAnswerSaved(true);
      // await saveQuestionAndAnswer({
      //   variables: {
      //     candidateId: uniqueId,
      //     question: questions[index]?.question,
      //     answer: transcript,
      //   },
      // });

      const endpoint = "https://hrbotbackend.dev.andaihub.com/api/interview_responses";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: uniqueId,
          clientId: clientId,
          question: questions[index]?.question,
          answer: transcript,
        }),
      });

      // if (response.ok) {
      //   toast.success("success");
      // }

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
      // await saveQuestionAndAnswer({
      //   variables: {
      //     candidateId: uniqueId,
      //     question: questions[index]?.question,
      //     answer: "",
      //   },
      // });

      const endpoint = "https://hrbotbackend.dev.andaihub.com/api/interview_responses";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: uniqueId,
          clientId: clientId,
          question: questions[index]?.question,
          answer: "",
        }),
      });

      if (index === questions.length - 1) {
        setShowSkipButton(false);
        setShowEndAndReview(true);
      } else {
        handleNextQuestion();
      }
      setIsQuestionSkipped(false);
    } catch (error) {
      console.log("error", error);
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
            Question {index + 1} / {questions?.length}
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

          {isUploading?.current === true && (
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
          )}

          <div className="absolute bottom-5 border h-[90px] p-5 w-max left-0 right-0 md:flex items-center justify-center mx-auto rounded-md  border-gray-300 z-50 bg-[#FFF8E3] hidden ">
            <AudioWave />
          </div>

          {showEndAndReview && (
            <div className=" w-full flex items-center justify-center">
              <button
                className=" border-2 rounded-lg px-4 py-1 font-medium bg-red-100 text-red-900 text-sm md:text-xl flex items-center justify-center mt-6 hover:scale-105 transition-all ease-out duration-300"
                onClick={() => reviewInterviewer()}
                disabled={loading}
              >
                {loading ? "Please Wait..." : "End Interview"}
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
            <div className=" mt-5 max-h-28 overflow-y-auto p-3">
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
