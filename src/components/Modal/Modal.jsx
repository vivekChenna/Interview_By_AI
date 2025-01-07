import React from "react";
import { useNavigate } from "react-router-dom";
import { BsExclamationOctagon } from "react-icons/bs";

const Modal = ({ ModalFunc }) => {
  const navigate = useNavigate();
  return (
    <div className=" inset-0 fixed bg-black bg-opacity-30 flex items-center justify-center">
      <div className=" bg-white md:w-1/3 w-11/12 rounded-lg border px-3 py-7 flex flex-col items-center gap-3">
        <div className=" p-2 bg-red-100 rounded-full w-max mt-2">
          <BsExclamationOctagon fontSize="1.5rem" color="red" />
        </div>
        <div className=" flex flex-col gap-2 px-2">
          <p className=" font-bold md:text-2xl text-xl  text-center">
            Return to question generation
          </p>
          <p className=" text-center md:text-lg">
            Are you sure you want to exit this interview and restart at the
            question generation step? You will not be able to continue the
            interview.
          </p>
        </div>

        <div className=" flex items-center gap-7">
          <button
            className=" rounded-3xl px-5 bg-gray-100 py-1"
            onClick={() => ModalFunc()}
          >
            Cancel
          </button>
          <button
            className=" rounded-3xl bg-red-100 px-5 py-1 text-red-800"
            onClick={() => navigate("/")}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
