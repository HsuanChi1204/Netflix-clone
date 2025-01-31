/* eslint-disable no-unused-vars */
import React from 'react';
import { useState } from "react";
import "./Login.css";
import logo from "../../assets/logo.png";
import netflix_spinner from "../../assets/netflix_spinner.gif";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const user_auth = async (event) => {
    event.preventDefault();
    
    // 基本驗證
    if (signState === "Sign Up") {
      if (!name.trim()) {
        toast.error('請輸入姓名');
        return;
      }
    }
    if (!email.trim()) {
      toast.error('請輸入電子郵件');
      return;
    }
    if (!password) {
      toast.error('請輸入密碼');
      return;
    }
    if (password.length < 6) {
      toast.error('密碼至少需要6個字符');
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
        
        toast.success('登錄成功！');
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
        
        toast.success('註冊成功！');
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        // 處理具體的錯誤消息
        if (error.response.data.errors) {
          // 驗證錯誤
          const errorMessages = error.response.data.errors.map(err => err.msg);
          errorMessages.forEach(msg => toast.error(msg));
        } else if (error.response.data.message) {
          // 一般錯誤消息
          toast.error(error.response.data.message);
        } else {
          toast.error('操作失敗，請稍後重試');
        }
      } else {
        toast.error('網絡錯誤，請檢查您的網絡連接');
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
        <h1>{signState}</h1>
        <form>
          {signState === "Sign Up" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your Name"
            />
          ) : null}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <button onClick={user_auth} type="submit">
            {signState}
          </button>
          <div className="form-help">
            <div className="remember">
              <input type="checkbox" />
              <label htmlFor="">Remember Me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>
        <div className="form-switch">
          {signState === "Sign In" ? (
            <p>
              New to Netflix?{" "}
              <span onClick={() => setSignState("Sign Up")}>
                Sign Up Now
              </span>
            </p>
          ) : (
            <p>
              Already have account?{" "}
              <span onClick={() => setSignState("Sign In")}>
                Sign In Now
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
