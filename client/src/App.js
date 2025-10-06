import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewsDisplay from './pages/NewsDisplay';
import ArticleDetails from './pages/ArticleDetails';
// import ApiTest from './components/ApiTest';
import SignInNav from "./layout/SignInNav";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

function App() {
    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/"); // clean URL
        }
    }, []);

  return (
      <Router>
          <Routes>
              <Route path="/" element={<SignInNav />}>


                  <Route index element={<NewsDisplay />} />
                  <Route path="article/:id" element={<ArticleDetails />} />
              </Route>
              <Route path="*" element={<NotFound />} />
          </Routes>
      </Router>
  );
}

export default App;
