import Home from "./pages/Home/Home";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Player from "./pages/Player/Player";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyList from "./pages/MyList/MyList";
import Search from "./pages/Search/Search";
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar/Navbar';
import AuthWrapper from './components/AuthWrapper/AuthWrapper';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<AuthWrapper><Home /></AuthWrapper>} />
            <Route path="/login" element={<Login />} />
            <Route path="/player/:id" element={<AuthWrapper><Player /></AuthWrapper>} />
            <Route path="/my-list" element={<AuthWrapper><MyList /></AuthWrapper>} />
            <Route path="/search" element={<AuthWrapper><Search /></AuthWrapper>} />
          </Routes>
          <ToastContainer theme="dark" />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
