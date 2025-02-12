import { createContext, useState } from "react";

export const Context = createContext();

const ContextProvider = (props) => {
  const [questions, setQuestions] = useState([]);
  const [jobDescription, setJobDescription] = useState("");

  return (
    <Context.Provider
      value={{
        questions,
        setQuestions,
        jobDescription,
        setJobDescription,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
