import './App.css';
import NewsDisplay from './components/NewsDisplay';
import ApiTest from './components/ApiTest';
import GeminiTester from "./GeminiTester";
import SignInNav from "./pages/SignInNav";

function App() {
  return (
    <div className="App">
        {/* Show API test component only in development */}
        {process.env.NODE_ENV === 'development' && <ApiTest />}
        <NewsDisplay />
      <SignInNav />   
    </div>
  );
}

export default App;
