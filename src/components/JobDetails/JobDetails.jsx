import React, { useState } from "react";
import {
  Frontend_Developer_Job_Description,
  Product_Manager_Job_Description,
  Backend_Developer_Job_Description,
  AI_Engineer_Job_Description,
  Marketing_Head_Job_Description,
  Data_Scientist_Job_Description,
} from "../../constants/JobDescription";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import runChat from "../../config/gemini";
import { useContext } from "react";
import { Context } from "../../context/context";
import { getGroqChatCompletion } from "../../config/groq";

const JobDetails = () => {
  // const [jobDescription, setJobDescription] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [btnName, setBtnName] = useState("Custom Job Description");

  const { setQuestions,jobDescription, setJobDescription } = useContext(Context);

  const navigate = useNavigate();

  const HandleSubmit = async (e) => {
    try {
      // if (jobDescription.length > 50) {
      e.preventDefault();
      // console.log("called run chat");
      setShowLoading(true);
      const data = await getGroqChatCompletion(jobDescription);

      const myQuestionData = data?.choices[0]?.message?.content;

      setQuestions(JSON.parse(myQuestionData));
      setShowLoading(false);
      navigate("/questions");
      // }
    } catch (error) {
      // console.log(error);
      // console.log("something went wrong");
      navigate("/error");
    }
  };

  const HandleChange = (e) => {
    setJobDescription(e.target.value);
  };

  const setJobDescriptionText = (e, text) => {
    setBtnName(e.target.name);
    setJobDescription(text);
  };

  return (
    <div className=" flex flex-col w-full items-center justify-center gap-5 mb-5 md:mb-0 mt-20">
      {/* title */}
      <h1 className=" sm:text-4xl text-3xl font-bold">
        Select a job description
      </h1>

      {/* job buttons */}
      <div className=" mt-5 flex flex-wrap items-center justify-center  md:justify-normal gap-4">
        {/* <button
          className={
            btnName === "Custom Job Description"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          name="Custom Job Description"
          onClick={(e) => setJobDescriptionText(e, "")}
        >
          Custom Job Description
        </button> */}
        <button
          name="Frontend Developer"
          className={
            btnName === "Frontend Developer"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          onClick={(e) =>
            setJobDescriptionText(e, Frontend_Developer_Job_Description)
          }
        >
          Frontend Developer
        </button>
        <button
          name="Product Manager"
          className={
            btnName === "Product Manager"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          onClick={(e) =>
            setJobDescriptionText(e, Product_Manager_Job_Description)
          }
        >
          Product Manager
        </button>
        <button
          name="Backend Developer"
          className={
            btnName === "Backend Developer"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          onClick={(e) =>
            setJobDescriptionText(e, Backend_Developer_Job_Description)
          }
        >
          Backend Developer
        </button>
        <button
          name="AI Engineer"
          className={
            btnName === "AI Engineer"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          onClick={(e) => setJobDescriptionText(e, AI_Engineer_Job_Description)}
        >
          AI Engineer
        </button>
        <button
          name="Data Scientist"
          className={
            btnName === "Data Scientist"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          onClick={(e) =>
            setJobDescriptionText(e, Data_Scientist_Job_Description)
          }
        >
          Data Scientist
        </button>
        <button
          className={
            btnName === "Marketing Head"
              ? "py-1 px-4 rounded-2xl bg-[#e4f8f4] text-[#509588] font-thin border-[#5ca799] border"
              : " py-1 px-4 rounded-2xl bg-gray-100 font-thin border-gray-300 border hover:bg-gray-300 transition-colors duration-200"
          }
          name="Marketing Head"
          onClick={(e) =>
            setJobDescriptionText(e, Marketing_Head_Job_Description)
          }
        >
          Marketing Head
        </button>
      </div>

      {/* input text area */}

      <form
        onSubmit={HandleSubmit}
        className=" flex flex-col mt-3 gap-7 items-center w-full"
      >
        <textarea
          name="jobdescription"
          id="jobdescription"
          // cols="80"
          className=" overflow-y-auto text-gray-500 p-3 border border-gray-400 rounded-lg md:text-lg md:h-96 h-72 md:w-1/2 w-11/12"
          // rows="12"
          required
          aria-required="true"
          value={jobDescription}
          placeholder="Select a job role above or paste your own description here"
          onChange={HandleChange}
        ></textarea>
        {showLoading ? (
          <p>working on it...</p>
        ) : (
          <div className=" rounded-3xl bg-blue-950 hover:shadow-lg flex items-center px-4 w-max scale-95 hover:scale-100 transition-all duration-300">
            <button
              type="submit"
              className=" text-white px-4 py-2 font-semibold drop-shadow-md"
            >
              Generate Questions
            </button>
            <FaArrowRightLong fontSize="1rem" color="#FFFFFF" />
          </div>
        )}
      </form>
    </div>
  );
};

export default JobDetails;
