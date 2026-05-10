import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import "../styles/login.css";
import { supabase } from "../supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors = [];

    if (!email) {
      newErrors.email = "Enter an email!";
    }

    if (!password) {
      newErrors.password = "Enter your password!";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      console.log(errors);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    setLoading(false);
    localStorage.setItem("activeSection", "main");
    navigate("/dashboard");
    return;
  };

  return (
    <div id="loginPage">
      <div className="container">
        <div className="loginForm" onSubmit={handleSubmit}>
          <h1>Login</h1>
          <div className="usernameField">
            <label htmlFor="emailinput">Email:</label>
            <input
              type="email"
              id="emailinput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="passwordField">
            <label htmlFor="passwordinput">Password:</label>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                id="passwordinput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="togglePassword"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
              </button>
            </div>

            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <button type="submit" className="submitBtn" onClick={handleSubmit}>
            {loading ? <div className="spinner"></div> : "Login"}
          </button>
          <p className="registerPg">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
