import { createContext, useState } from "react";

export const Context = createContext();

const ContextProvider = (props) => {
  const [questions, setQuestions] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [userPdfDetails, setUserPdfDetails] = useState({
    pdfReport: "",
    userName: "",
    userScore: "",
  });

  return (
    <Context.Provider
      value={{
        questions,
        setQuestions,
        jobDescription,
        setJobDescription,
        userPdfDetails, setUserPdfDetails
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
