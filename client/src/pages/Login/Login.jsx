/* eslint-disable no-unused-vars */
import React from 'react';
import { useState } from "react";
import "./Login.css";
import logo from "../../assets/logo.png";
import netflix_spinner from "../../assets/netflix_spinner.gif";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";

const Login = () => {
  const navigate = useNavigate();
  const [signState, setSignState] = useState("Sign In");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();

  const user_auth = async (event) => {
    event.preventDefault();
    
    // 基本驗證
    if (signState === "Sign Up") {
      if (!name.trim()) {
        toast.error(t('auth.nameRequired'));
        return;
      }
    }
    if (!email.trim()) {
      toast.error(t('auth.emailRequired'));
      return;
    }
    if (!password) {
      toast.error(t('auth.passwordRequired'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.passwordLength'));
      return;
    }
    
    setLoading(true);
    try {
      if (signState === "Sign In") {
        // 登錄
        const response = await axios.post('http://localhost:5001/api/auth/login', {
          email,
          password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success(t('auth.loginSuccess'));
        navigate('/');
      } else {
        // 註冊
        const response = await axios.post('http://localhost:5001/api/auth/register', {
          name,
          email,
          password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success(t('auth.registerSuccess'));
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        if (error.response.data.errors) {
          const errorMessages = error.response.data.errors.map(err => err.msg);
          errorMessages.forEach(msg => toast.error(msg));
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(t('auth.operationFailed'));
        }
      } else {
        toast.error(t('auth.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="login-spinner">
      <img src={netflix_spinner} alt="" />
    </div>
  ) : (
    <div className="login">
      <img src={logo} className="login-logo" alt="" />
      <div className="login-form">
        <h1>{signState === "Sign In" ? t('auth.signIn') : t('auth.signUp')}</h1>
        <form onSubmit={user_auth}>
          {signState === "Sign Up" && (
            <div className="input_box">
              <input
                type="text"
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="input_box">
            <input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input_box">
            <input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? (
              <img src={netflix_spinner} alt="" />
            ) : signState === "Sign In" ? (
              t('auth.signIn')
            ) : (
              t('auth.signUp')
            )}
          </button>
          <div className="form-help">
            <div className="remember">
              <input type="checkbox" />
              <label>{t('auth.rememberMe')}</label>
            </div>
            <p>{t('auth.needHelp')}</p>
          </div>
        </form>
        <div className="form-switch">
          {signState === "Sign In" ? (
            <p onClick={() => setSignState("Sign Up")}>
              {t('auth.switchToSignUp')}
            </p>
          ) : (
            <p onClick={() => setSignState("Sign In")}>
              {t('auth.switchToSignIn')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
