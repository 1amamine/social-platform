import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { supabase } from "../supabase";

function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const defaultImage = ` https://ui-avatars.com/api/?name=${userName}background=0D8ABC&color=fff`;
  const defaultBanner =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%234f46e5'/><stop offset='100%' stop-color='%239333ea'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/></svg>";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors = [];

    if (!email) {
      newErrors.email = "Enter an email!";
    }

    if (!password) {
      newErrors.password = "Enter a password!";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      console.log(errors);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setLoading(false);
      console.log("Error details:", error.status, error.message);
      alert(error.message);
      return;
    }

    if (data.user) {
      const newUser = {
        id: data.user.id,
        userName,
        email,
        image: defaultImage,
        banner: defaultBanner,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert(newUser);
      if (profileError) {
        setLoading(false);
        alert(profileError.message);
        console.log(profileError.message);
      } else {
        setLoading(false);
        alert("Success! Check your email for a link.");
        localStorage.setItem("activeSection", "main");
        navigate("/dashboard");
      }
    }
  };
  return (
    <div id="registerPage">
      <div className="container">
        <form onSubmit={handleSignUp} className="registerForm">
          <h1>Register</h1>
          <div className="usernameField">
            <label htmlFor="usernameinput">Username:</label>
            <input
              type="text"
              id="usernameinput"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
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
          <button type="submit" className="submitBtn">
            {loading ? <div className="spinner"></div> : "Register"}
          </button>
          <p className="loginPg">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
