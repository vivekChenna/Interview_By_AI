import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";

const Home = () => {
  return (
    <div className="w-full flex flex-col gap-6 items-center justify-center mt-6">
      <div className=" w-max rounded-md bg-[#ebf9f6] text-[#5ca799] px-1">
        118,068 questions answered!
      </div>
      <div>
        <p className=" font-bold md:text-4xl text-3xl text-center font-sans">
          Boost your confidence with{" "}
          <span className=" text-[#5ca799]">AI-generated</span>{" "}
        </p>
        <p className=" font-sans font-bold md:text-4xl text-3xl text-center">
          interview questions and answers
        </p>
      </div>
      <div className=" rounded-3xl bg-blue-950 hover:shadow-lg flex items-center px-4  scale-95 hover:scale-100 transition-all duration-300 ">
        <Link to="/launch">
          <button className=" text-white px-4 py-2 font-semibold">
            Try now for free
          </button>
        </Link>
        <FaArrowRightLong fontSize="1rem" color="#FFFFFF" />
      </div>
    </div>
  );
};

export default Home;
