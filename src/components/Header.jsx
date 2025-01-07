import React from "react";
import AiLogo from "../assets/Images/ai_logo.jpg";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className=" h-24 md:px-10 md:py-6 py-4">
      <div className=" flex items-center md:gap-3">
        <div>
          <Link>
            <img
              src={AiLogo}
              alt="AI"
              className="
            w-16 rounded-full"
            />
          </Link>
        </div>
        <h1 className=" font-bold font-sans text-xl drop-shadow">
          Interview By AI
        </h1>
      </div>
    </div>
  );
};

export default Header;
