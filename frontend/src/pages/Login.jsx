import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styling/Login.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

// recaptcha_site_key = "6LcnmsoqAAAAAMAtQQbQay6CeulSMm5FhpXeNsAn";

const recaptcha_site_key = "6LcnmsoqAAAAAMAtQQbQay6CeulSMm5FhpXeNsAn";




const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    contactNumber: "",
    password: "",
  });

  const [recaptchaValue, setRecaptchaValue] = useState(null); 

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };
  useEffect(() => {
    console.log("Login page loaded");
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");
    const casError = params.get("cas_error");

    if (casError) {
      setMessage(decodeURIComponent(casError));
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      login(token);
      navigate(location.state?.from?.pathname || "/Profile");
      return;
    }

    if (isLogin) {
      const verifyToken = async () => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await axios.post(
              "http://localhost:5688/users/verify",
              { token }
            );
            if (response.data.valid) {
              login(token);
              navigate(location.state?.from?.pathname || "/Profile");
            } else {
              localStorage.removeItem("token"); 
            }
          } catch (error) {
            console.error("Token verification failed", error);
            localStorage.removeItem("token"); 
          }
        } else {
          console.log("Token not found");
        }
      };

      verifyToken();
    } else {
      console.log("Registration page");
    }
  }, [navigate, login, location, isLogin]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleCasLogin = async () => {
    try {
      window.location.href = "http://localhost:5688/users/cas/login";
      return;
    } catch (error) {
      setMessage("Failed to initiate IIIT login. Please try again.");
    }
  };

  const logina = async () => {
    try {
      if (!recaptchaValue) {
        setMessage("Please complete the CAPTCHA.");
        return;
      }

    try {
      const captchaResponse = await axios.post("http://localhost:5688/verify-captcha", {
        token: recaptchaValue,
      });

      if (!captchaResponse.data.success) {
        setMessage("CAPTCHA verification failed. Please try again.");
        return;
      }
    } catch (error) {
      console.error("CAPTCHA verification error:", error);
      setMessage("CAPTCHA verification failed due to server error. Please try again later.");
      return;
    }

      console.log("password:", userData.password);
      const temp_password = userData.password;
      const response = await axios.post("http://localhost:5688/users/check", {
        email,
        password_check: temp_password,
      });
      const {
        exists,
        erorr_issue,
        token,
        message: serverMessage,
      } = response.data;
      if (!exists) {
        if (erorr_issue === "email") {
          setMessage("User does not exist, please fill out the details.");
        } else if (error_issue === "cas_user") {
          setMessage(
            "Please use the 'Login with IIIT Account' button for this email."
          );
        } else {
          setMessage("Password is incorrect");
        }
      } else {
        localStorage.setItem("token", token);
        login(token);
        setMessage("Login successful!");
        navigate(location.state?.from?.pathname || "/Profile");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  const register = async () => {
    if (!recaptchaValue) {
      setMessage("Please complete the CAPTCHA.");
      return;
    }

    try {

    
    const captchaResponse = await axios.post("http://localhost:5688/verify-captcha", {
      token: recaptchaValue,
    });

    if (!captchaResponse.data.success) {
      setMessage("CAPTCHA verification failed. Please try again.");
      return;
    }

      const response = await axios.post("http://localhost:5688/users", {
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userData.age,
        contactNumber: userData.contactNumber,
        password: userData.password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User created:", response.data);
      login(token);
      setMessage("Registration successful!");
      navigate(location.state?.from?.pathname || "/Profile");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern =
      /^[a-zA-Z0-9._]+\.+([a-zA-Z0-9._]+)@students\.iiit\.ac\.in$/;
    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid college email address.");
      return;
    }

    if (!userData.password || userData.password.length < 1) {
      setMessage("Password must be at least  1 characters long.");
      return;
    }

  
    if (!isLogin) {
      if (
        !userData.firstName ||
        !userData.lastName ||
        !userData.age ||
        !userData.contactNumber
      ) {
        setMessage("Please fill out all registration fields.");
        return;
      }

      if (isNaN(userData.age) || userData.age < 16 || userData.age > 100) {
        setMessage("Please enter a valid age between 16 and 100.");
        return;
      }

      const phonePattern = /^\d{10}$/;
      if (!phonePattern.test(userData.contactNumber)) {
        setMessage("Please enter a valid 10-digit contact number.");
        return;
      }

      await register();
    } else {
      await logina();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="icon-container">
          <i className="user-icon">🌸</i>
        </div>

        <h2>{isLogin ? "Login" : "Register"}</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">College Email ID</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Enter your first name"
                  value={userData.firstName}
                  onChange={(e) =>
                    setUserData({ ...userData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Enter your last name"
                  value={userData.lastName}
                  onChange={(e) =>
                    setUserData({ ...userData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  placeholder="Enter your age"
                  value={userData.age}
                  onChange={(e) =>
                    setUserData({ ...userData, age: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  placeholder="Enter your contact number"
                  value={userData.contactNumber}
                  onChange={(e) =>
                    setUserData({ ...userData, contactNumber: e.target.value })
                  }
                  required
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

      
        {isLogin && (
          <>
            <div className="or-divider">
              <span>OR</span>
            </div>

            <button
              onClick={handleCasLogin}
              className="cas-auth-button"
              type="button"
            >
              Login with IIIT Account
            </button>
          </>
        )}

        <div className="recaptcha-container">
          <ReCAPTCHA
            sitekey={recaptcha_site_key}
            onChange={handleRecaptchaChange}
          />
        </div>

        <p className="toggle-auth">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="link-button">
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="link-button">
                Login
              </button>
            </>
          )}
        </p>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
