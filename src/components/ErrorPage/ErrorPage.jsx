import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className=" w-full min-h-[500px] flex flex-col gap-6 items-center justify-center">
      <p className=" text-5xl font-bold">Your Interview link is Expired!</p>
    </div>
  );
};

export default ErrorPage;
