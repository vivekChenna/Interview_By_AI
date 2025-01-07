import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className=" w-full h-full flex flex-col gap-6 items-center justify-center">
      <p className=" text-4xl font-bold">Oops Something went wrong</p>
      <p className=" text-4xl font-bold">Internal Server Error</p>
      <p className=" text-2xl font-bold">
        Please refresh the page and try Again
      </p>
      <div className=" w-max underline">
        <Link to="/">go to home page</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
