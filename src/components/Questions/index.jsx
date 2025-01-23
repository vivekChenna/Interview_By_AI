import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import "regenerator-runtime/runtime";
import { Context } from "../../context/context";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { BsFillMicFill } from "react-icons/bs";
import { FaPause } from "react-icons/fa";
import runChat from "../../config/gemini";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import Modal from "../Modal/Modal";
import { getGroqChatCompletion, reviewSolutions } from "../../config/groq";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import RulesAndRegulations from "../RulesAndRegulations";
import { getQuestions } from "../../utils/questions";

const QuestionsPage = () => {
  const { userName, jobRole, uniqueId } = useParams();
  const navigate = useNavigate();
  console.log("unique id", uniqueId);

  const { questions, jobDescription, setQuestions } = useContext(Context);
  const [startInterview, setStartInterview] = useState(false);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNextQuestionBtn, setShowNextQuestionBtn] = useState(false);
  const [showEndAndReview, setShowEndAndReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions(); // Fetch questions
        setQuestions(data); // Set questions in context
      } catch (error) {
        console.log("Failed to fetch questions. Please try again.");
      } finally {
        setLoading(false); // Stop loading after completion
      }
    };

    fetchQuestions();
  }, []);

  const [savedTranscript, setSavedTranscript] = useState([]);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [userScore, setUserScore] = useState("");
  const [loading, setLoading] = useState(false);
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
        }
      }
    `,
    {
      variables: {
        id: uniqueId,
      },
      onCompleted: (data) => {
        console.log(data);

        console.log("date and time", data?.Candidate?.[0]?.link_expiration);
        const expirationTime = new Date(data?.Candidate?.[0]?.link_expiration);
        const currentTime = new Date();

        console.log("expiration", expirationTime);
        console.log("current time", currentTime);

        if (currentTime > expirationTime) {
          navigate("/error");
        }
      },
      onError: (error) => {
        console.log("something went wrong");
      },
    }
  );

  const enableFullScreen = () => {
    setStartInterview(true);
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error("Error enabling fullscreen mode:", err);
      });
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  // useEffect(() => {
  //   enableFullScreen(); // Enable fullscreen when the page loads

  //   const handleFullscreenChange = () => {
  //     if (!document.fullscreenElement) {
  //       // If the user exits fullscreen, re-enable it
  //       enableFullScreen();
  //     }
  //   };

  //   // Add event listeners for fullscreen changes
  //   document.addEventListener("fullscreenchange", handleFullscreenChange);
  //   document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  //   document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  //   document.addEventListener("msfullscreenchange", handleFullscreenChange);
  //   document.addEventListener("contextmenu", (e) => {
  //     e.preventDefault();
  //   });

  //   return () => {
  //     // Clean up event listeners
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //     document.removeEventListener("contextmenu", disableRightClick);
  //     document.removeEventListener(
  //       "webkitfullscreenchange",
  //       handleFullscreenChange
  //     );
  //     document.removeEventListener(
  //       "mozfullscreenchange",
  //       handleFullscreenChange
  //     );
  //     document.removeEventListener(
  //       "msfullscreenchange",
  //       handleFullscreenChange
  //     );
  //   };
  // }, []);

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       alert("You cannot switch tabs during the interview.");
  //       window.location.reload(); // Optionally reload or log the attempt
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, []);

  if (!browserSupportsSpeechRecognition) {
    return <p> your browser does not support speech recognition</p>;
  }

  const handleNextQuestion = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);

      HandleRestart();
    }
  };

  const reviewInterviewer = async () => {
    setLoading(true);
    const data = await reviewSolutions(jobDescription, savedTranscript);
    setUserScore(data?.choices[0]?.message?.content);
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const HandleRestart = () => {
    setIsRecording(false);
    setTimeLeft(0);
    setShowSubmitBtn(false);
    resetTranscript();
    setShowNextQuestionBtn(false);
  };

  useEffect(() => {
    let timer = null;

    if (isRecording) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime < 120) {
            return prevTime + 1;
          } else {
            setIsRecording(false);
            stopListening(); // Stop recording when time runs out
            setShowSubmitBtn(true);
            return 120;
          }
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => {
      // console.log("hello");
      clearInterval(timer);
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  console.log("savedtranscript", savedTranscript);

  const SubmitHandler = async () => {
    // console.log("transcript");
    // console.log(transcript);
    try {
      setErrorMsg("");
      // setShowShimmer(true);
      // const data = await runChat(questions[index]?.question, 1, transcript);
      // const ans = await runChat(questions[index]?.question, 2);
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
      ]);
      // console.log("printing ans");
      // console.log(ans);
      // console.log("ans", typeof ans);
      setShowSubmitBtn(false);
      // setShowShimmer(false);
      // setShowFeedBack(data.toString());
      // setShowAiAnswer(ans.toString());
      // setQuestionBtn(false);
      if (index < questions.length - 1) {
        setShowNextQuestionBtn(true);
      } else {
        setShowNextQuestionBtn(false);
      }
      if (index === questions.length - 1) {
        setShowEndAndReview(true);
      }
      // setShowAnswers({
      //   feedback: true,
      //   sample: true,
      // });
    } catch (error) {
      console.log(error);

      // setShowShimmer(false);
      setErrorMsg("Internal Server Error, Please Click on Submit Once Again");
    }
  };

  const HandleQuestionGeneration = () => {
    setShowModal(true);
  };

  const ModalFunc = () => {
    setShowModal(false);
  };

  // const HandleToggleAnswers = (key) => {
  //   setShowAnswers((prevState) => ({
  //     ...prevState,
  //     [key]: !prevState[key],
  //   }));
  // };

  return !startInterview ? (
    <RulesAndRegulations
      setStartInterview={() => {
        setStartInterview(true);
        enableFullScreen();
      }}
    />
  ) : (
    <div className=" flex flex-col items-center justify-center h-full">
      <div className="w-1/2 flex items-center md:flex-row flex-col md:gap-0 gap-5 justify-between mb-8">
        {/* <button
          className="flex items-center  md:px-4 md:py-1 gap-2 text-gray-500 hover:opacity-80 transition-colors hover:duration-200"
          onClick={HandleQuestionGeneration}
        >
          <FaArrowLeftLong color="#B0B0B0" /> Question Generation
        </button> */}
        <div
          className={
            // showPreviousBtn
            // ?
            " border border-gray-400 flex items-center rounded-3xl py-1 px-3"
            // : "border border-gray-400 flex items-center rounded-3xl py-1 pl-4"
          }
        >
          {/* {showPreviousBtn && (
            <button
              className=" flex items-center mr-2"
              onClick={HandlePreviousQuestion}
            >
              <MdKeyboardArrowLeft color="#B0B0B0" fontSize="1.5rem" />
            </button>
          )} */}

          <button
            className=" flex items-center gap-2 text-sm md:text-[16px]"
            // onClick={handleNextQuestion}
            // disabled={QuestionBtn}
          >
            Question {index + 1}
            {/* <MdKeyboardArrowRight color="#B0B0B0" fontSize="1.5rem" /> */}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <div className=" md:w-1/2 w-11/12 min-h-80 rounded-2xl p-4 shadow-md border border-gray-300">
          <div>
            <p className=" text-black md:text-2xl text-lg text-center font-semibold">
              {questions[index]?.question}
            </p>
          </div>

          {/* timer */}
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
                stopListening();
              }}
            >
              <div className=" border bg-red-600 p-4 flex items-center justify-center w-max rounded-full">
                <FaPause color="white" fontSize="1.8rem" />
              </div>
            </div>
          )}

          {!isRecording &&
            !showSubmitBtn &&
            !showNextQuestionBtn &&
            !showEndAndReview && (
              <div
                className=" w-full flex items-center justify-center mt-7 cursor-pointer"
                onClick={() => {
                  setIsRecording(true);
                  startListening();
                }}
              >
                <div className=" border bg-red-600 p-4 flex items-center justify-center w-max rounded-full">
                  <BsFillMicFill color="white" fontSize="2rem" />
                </div>
              </div>
            )}

          <p className="text-center">{transcript}</p>

          {showSubmitBtn && (
            <div className=" w-full flex items-center justify-center mt-8 gap-4">
              <button
                className=" md:px-5 px-3 md:py-[6px] py-[3px] font-semibold rounded-2xl text-white bg-blue-950 shadow-md "
                onClick={() => SubmitHandler()}
              >
                Save
              </button>
              {/* <button
                className=" rounded-2xl text-black border border-gray-400 md:px-4 px-3 py-1"
                onClick={() => HandleRestart()}
              >
                Retry
              </button> */}
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
                className=" border rounded-3xl px-4 py-1 font-medium bg-red-100 text-red-900 text-sm md:text-[16px] flex items-center justify-center mt-6 hover:scale-105 transition-all ease-out duration-300"
                onClick={() => reviewInterviewer()}
                disabled={loading}
              >
                End & Review
              </button>
            </div>
          )}
        </div>
        {/* <div className="md:w-1/2 w-11/12 border rounded-b-2xl mb-4 shadow-sm bg-slate-100 bg-opacity-40">
          <div className=" flex flex-col border-b-2 px-5 py-3">
            <div className=" flex items-center justify-between">
              <p className="font-bold text-gray-500 md:text-lg">Feedback</p>
              <button
                disabled={showFeedBack.length > 0 ? false : true}
                onClick={() => HandleToggleAnswers("feedback")}
              >
                <MdKeyboardArrowRight fontSize="1.5rem" />
              </button>
            </div>
            {showShimmer ? (
              <Skeleton count={5} />
            ) : (
              <div
                className={
                  ShowAnswers.feedback
                    ? "pt-1 md:pb-4 pb-1 md:text-lg text-gray-600"
                    : "hidden"
                }
              >
                <Markdown>{showFeedBack}</Markdown>
              </div>
            )}
          </div>
          <div className=" flex flex-col px-5 py-3">
            <div className=" flex items-center justify-between">
              <p className=" font-bold text-gray-500 md:text-lg">
                Sample Answer
              </p>
              <button
                disabled={ShowAiAnswer.length > 0 ? false : true}
                onClick={() => HandleToggleAnswers("sample")}
              >
                <MdKeyboardArrowRight fontSize="1.5rem" />
              </button>
            </div>

            {showShimmer ? (
              <Skeleton count={5} />
            ) : (
              <div
                className={
                  ShowAnswers.sample
                    ? "pt-1 md:pb-4  md:text-lg text-gray-600"
                    : "hidden"
                }
              >
                <Markdown>{ShowAiAnswer}</Markdown>
              </div>
            )}
          </div>
        </div> */}
      </div>

      <div className=" flex items-center justify-center mx-6 mb-2">
        <p className=" text-red-600 ">{errorMsg}</p>
      </div>
      {userScore !== "" && (
        <div className="flex items-center justify-center mx-6 mt-5">
          <p className=" text-green-500 sm:text-2xl">{`Your score is ${userScore}`}</p>
        </div>
      )}

      {showModal ? <Modal ModalFunc={ModalFunc} /> : null}
    </div>
  );
};

export default QuestionsPage;
