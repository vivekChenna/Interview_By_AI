import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "regenerator-runtime/runtime";
import { Context } from "../../context/context";
import { BsFillMicFill } from "react-icons/bs";
import { FaPause } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "../Modal/Modal";
import { reviewSolutions } from "../../config/groq";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
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
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const QuestionsPage = () => {
  const { userName, jobRole, uniqueId } = useParams();
  const navigate = useNavigate();

  const { questions, jobDescription, setQuestions } = useContext(Context);
  const [startInterview, setStartInterview] = useState(false);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNextQuestionBtn, setShowNextQuestionBtn] = useState(false);
  const [showEndAndReview, setShowEndAndReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isInterviewStarted, SetIsInterviewStarted] = useState(false);
  const [savedTranscript, setSavedTranscript] = useState([]);
  const [isQuestionAndAnswerSaved, setIsQuestionAndAnswerSaved] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const deepgramRef = useRef(null);
  const timerRef = useRef(null);

  const {
    data,
    error,
    loading: waiting,
  } = useQuery(
    gql`
      query getCandidate($id: uuid!) {
        Candidate(where: { id: { _eq: $id } }) {
          id
          name
          email
          job_role
          link_expiration
          is_link_used
        }
      }
    `,
    {
      variables: {
        id: uniqueId,
      },
      onCompleted: (data) => {
        const expirationTime = new Date(data?.Candidate?.[0]?.link_expiration);
        const currentTime = new Date();

        if (data?.Candidate?.[0]?.is_link_used === true) {
          navigate("/error");
        }

        if (currentTime > expirationTime) {
          navigate("/error");
        }
      },
      onError: (error) => {},
    }
  );

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
          // console.log("Connection opened");
        });

        connection.addListener(LiveTranscriptionEvents.Error, (error) => {
          // console.error("Deepgram error:", error);
        });

        connection.addListener(LiveTranscriptionEvents.Transcript, (data) => {
          const transcription = data.channel.alternatives[0];

          // console.log("Transcript received:", transcription);

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
      if (deepgramRef.current) {
        deepgramRef.current.finish();
        deepgramRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions(
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
            : ""
        );
        setQuestions(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const [saveQuestionAndAnswer] = useMutation(gql`
    mutation SaveQuestionAndAnswer(
      $candidateId: uuid!
      $question: String!
      $answer: String!
    ) {
      insert_Interview_responses_one(
        object: {
          candidate_id: $candidateId
          question: $question
          answer: $answer
        }
      ) {
        id
      }
    }
  `);

  const [updateLinkUsed] = useMutation(gql`
    mutation UpdateLinkUsed($id: uuid!) {
      update_Candidate_by_pk(
        pk_columns: { id: $id }
        _set: { is_link_used: true }
      ) {
        id
        is_link_used
      }
    }
  `);

  const [updateUserScore] = useMutation(gql`
    mutation updateUserScore($id: uuid!, $user_score: String!) {
      update_Candidate_by_pk(
        pk_columns: { id: $id }
        _set: { user_score: $user_score }
      ) {
        id
        user_score
      }
    }
  `);
  const startListening = async () => {
    try {
      if (!deepgramRef.current) {
        throw new Error("Deepgram connection not initialized");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && deepgramRef.current) {
          deepgramRef.current.send(event.data);
        }
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTranscript("");
      setInterimTranscript("");
    } catch (error) {
      // console.error("Error accessing microphone:", error);
    }
  };

  const stopListening = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = null;
      mediaRecorderRef.current = null;
      setInterimTranscript("");
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (index !== 0) {
      setIsRecording(true);
    }
  }, [index]);

  useEffect(() => {
    return () => {
      stopListening(); // Stop recording
      if (deepgramRef.current) {
        deepgramRef.current.finish(); // Properly close the connection
        deepgramRef.current = null;
      }
    };
  }, []);

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
        alert("You cannot switch tabs during the interview.");
        // window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleNextQuestion = () => {
    if (index < questions.length - 1) {
      // stopListening();
      setIndex(index + 1);

      HandleRestart();
    }
  };

  const reviewInterviewer = async () => {
    const data = await reviewSolutions(jobDescription, savedTranscript);
    await updateUserScore({
      variables: {
        id: uniqueId,
        user_score: data?.choices[0]?.message?.content,
      },
    });

    navigate("/complete");
  };

  const HandleRestart = () => {
    setIsRecording(false);
    setTimeLeft(0);
    setTranscript("");
    setShowSubmitBtn(false);
    setShowNextQuestionBtn(false);
  };

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed >= 120) {
          setIsRecording(false);
          setShowSubmitBtn(true);
          setTimeLeft(120);
        } else {
          setTimeLeft(elapsed);
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
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
      setIsQuestionAndAnswerSaved(false);

      setSavedTranscript((prev) => [
        ...prev,
        {
          question: questions[index]?.question,
          answer: transcript,
        },
      ]);
      setShowSubmitBtn(false);

      if (index < questions.length - 1) {
        setShowNextQuestionBtn(true);
      } else {
        setShowNextQuestionBtn(false);
      }
      if (index === questions.length - 1) {
        setShowEndAndReview(true);
      }
    } catch (error) {
      // console.log(error);
      setErrorMsg("Internal Server Error, Please Click on Submit Once Again");
    }
  };

  const ModalFunc = () => {
    setShowModal(false);
  };

  return !startInterview ? (
    <RulesAndRegulations
      isInterviewStarted={isInterviewStarted}
      setStartInterview={async () => {
        SetIsInterviewStarted(true);
        await updateLinkUsed({
          variables: {
            id: uniqueId,
          },
        });
        await startListening();
        SetIsInterviewStarted(false);
        setStartInterview(true);
        enableFullScreen();
      }}
    />
  ) : (
    <div className=" flex flex-col items-center justify-center h-full">
      <div className="w-1/2 flex items-center md:flex-row flex-col md:gap-0 gap-5 justify-between mb-8">
        <div
          className={
            " border border-gray-400 flex items-center rounded-3xl py-1 px-3"
          }
        >
          <button className=" flex items-center gap-2 text-sm md:text-[16px]">
            Question {index + 1} / 10
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <div className=" md:w-1/2 w-11/12 min-h-80 rounded-2xl p-4 shadow-md border border-gray-300">
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

          {isRecording && (
            <div
              className=" w-full flex items-center justify-center mt-7 cursor-pointer"
              onClick={() => {
                setIsRecording(false);
                setShowSubmitBtn(true);
              }}
            >
              <div className=" border bg-red-600 p-4 flex items-center justify-center w-max rounded-full">
                <FaPause color="white" fontSize="1.8rem" />
              </div>
            </div>
          )}

          {/* {!isRecording &&
            !showSubmitBtn &&
            !showNextQuestionBtn &&
            !showEndAndReview &&
            index === 0 && (
              <div
                className=" w-full flex items-center justify-center mt-7 cursor-pointer"
                onClick={ () => {
                
                  setIsRecording(true);
                }}
              >
                <div className=" border bg-red-600 p-4 flex items-center justify-center w-max rounded-full">
                  <BsFillMicFill color="white" fontSize="2rem" />
                </div>
              </div>
            )} */}

          <p className="text-center">{transcript}</p>

          {showSubmitBtn && (
            <div className=" w-full flex items-center justify-center mt-8 gap-4">
              <button
                disabled={isQuestionAndAnswerSaved}
                className=" md:px-5 px-3 md:py-[6px] py-[3px] font-semibold rounded-2xl text-white bg-blue-950 shadow-md "
                onClick={() => SubmitHandler()}
              >
                {isQuestionAndAnswerSaved ? "Saving..." : " Save"}
              </button>
            </div>
          )}

          {showNextQuestionBtn ? (
            <div className=" w-full flex items-center justify-center mt-6">
              <button
                className=" w-max md:px-5 px-4 py-1 drop-shadow-md rounded-3xl text-lg scale-95 hover:scale-100 transition-all duration-300 bg-blue-950 text-white shadow-md"
                onClick={handleNextQuestion}
              >
                Next Question
              </button>
            </div>
          ) : null}
          {showEndAndReview && (
            <div className=" w-full flex items-center justify-center">
              <button
                className=" border rounded-2xl px-4 py-1 font-medium bg-red-100 text-red-900 text-sm md:text-xl flex items-center justify-center mt-6 hover:scale-105 transition-all ease-out duration-300"
                onClick={() => reviewInterviewer()}
                disabled={loading}
              >
                End Interview
              </button>
            </div>
          )}
        </div>
      </div>

      <div className=" flex items-center justify-center mx-6 mb-2">
        <p className=" text-red-600 ">{errorMsg}</p>
      </div>

      {showModal ? <Modal ModalFunc={ModalFunc} /> : null}
    </div>
  );
};

export default QuestionsPage;
