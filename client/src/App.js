import './App.css';
// import GeminiTester from "./GeminiTester";
import NewsDisplay from './components/NewsDisplay';
import ApiTest from './components/ApiTest';


function App() {
  return (
    <div className="App">
        {/* Show API test component only in development */}
        {process.env.NODE_ENV === 'development' && <ApiTest />}
        <NewsDisplay />
    </div>
  );
}

export default App;
