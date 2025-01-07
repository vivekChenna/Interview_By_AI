import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import JobDetails from "./components/JobDetails/JobDetails";
import QuestionsPage from "./components/Questions";
import ContextProvider from "./context/context";
import ErrorPage from "./components/ErrorPage/ErrorPage";

function App() {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Header />
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<JobDetails />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </ContextProvider>
    </BrowserRouter>
  );
}

export default App;
