import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewsDisplay from './pages/NewsDisplay';
// import ApiTest from './components/ApiTest';
import SignInNav from "./layout/SignInNav";
import NotFound from "./pages/NotFound";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<SignInNav />}>


                  <Route index element={<NewsDisplay />} />

              </Route>
              <Route path="*" element={<NotFound />} />
          </Routes>
      </Router>
  );
}

export default App;
