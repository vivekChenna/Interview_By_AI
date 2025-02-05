import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./config/graphql-client";
import Header from "./components/Header";
import QuestionsPage from "./components/Questions";
import ContextProvider from "./context/context";
import ErrorPage from "./components/ErrorPage/ErrorPage";
import InterviewComplete from "./components/InterviewComplete/index.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <ContextProvider>
          <Header />
          <Routes>
            <Route path="/error" element={<ErrorPage />} />
            <Route
              path="/interview/:userName/:jobRole/:uniqueId"
              element={<QuestionsPage />}
            />
            <Route path="/complete" element={<InterviewComplete />} />
          </Routes>
          <Toaster />
        </ContextProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
