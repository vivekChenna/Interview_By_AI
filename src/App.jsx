import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./config/graphql-client";
import Header from "./components/Header";
import Home from "./components/Home";
import JobDetails from "./components/JobDetails/JobDetails";
import QuestionsPage from "./components/Questions";
import ContextProvider from "./context/context";
import ErrorPage from "./components/ErrorPage/ErrorPage";
import InterviewComplete from "./components/InterviewComplete";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <ContextProvider>
          <Header />
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            {/* <Route path="/" element={<JobDetails />} /> */}
            {/* <Route path="/questions" element={<QuestionsPage />} /> */}
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/interview/:userName/:jobRole/:uniqueId" element={<QuestionsPage/>} />
            <Route path="/complete" element={<InterviewComplete />} />
          </Routes>
        </ContextProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;