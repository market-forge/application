import './App.css';
import NewsDisplay from './components/NewsDisplay';
import ApiTest from './components/ApiTest';
import SignInNav from "./pages/SignInNav";

function App() {
  return (
    <div>
        <SignInNav />
        {/* Show API test component only in development */}
        {process.env.NODE_ENV === 'development' && <ApiTest />}
        <NewsDisplay />
    </div>
  );
}

export default App;
