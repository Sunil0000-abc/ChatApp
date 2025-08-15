import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
    newPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const baseUrl = "https://chatapp-3-716o.onrender.com";
  const handleSubmit = async (e) => {
    e.preventDefault();
    let endpoint = '';

    if (mode === "login") {
      endpoint = `${baseUrl}/api/auth/login`;
    } else if (mode === "signup") {
      endpoint = `${baseUrl}/api/auth/signup`;
    } else if (mode === "forgot") {
      endpoint = `${baseUrl}/api/auth/forgot-password`;
    } else if (mode === "reset") {
      endpoint = `${baseUrl}/api/auth/reset-password`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        if (mode === "login") {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(data.userdata));
          navigate('/chat');
        } else if (mode === "signup") {
          alert("Signup successful, please login");
          setMode("login");
        } else if (mode === "forgot") {
          alert("OTP sent to your email");
          setMode("reset");
        } else if (mode === "reset") {
          alert("Password reset successful, please login");
          setMode("login");
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" && "Login"}
          {mode === "signup" && "Sign Up"}
          {mode === "forgot" && "Forgot Password"}
          {mode === "reset" && "Reset Password"}
        </h2>

        {mode === "signup" && (
          <input
            type="text"
            name="name"
            placeholder="Username"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full mb-3 p-2 border border-gray-300 rounded"
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border border-gray-300 rounded"
        />

        {(mode === "login" || mode === "signup") && (
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
        )}

        {mode === "reset" && (
          <>
            <input
              type="text"
              name="otp"
              placeholder="OTP"
              value={formData.otp}
              onChange={handleChange}
              required
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {mode === "login" && "Login"}
          {mode === "signup" && "Sign Up"}
          {mode === "forgot" && "Send OTP"}
          {mode === "reset" && "Reset Password"}
        </button>

        
        <div className="text-center mt-4 text-sm space-y-2">
          {mode === "login" && (
            <>
              <p>
                Don't have an account?{" "}
                <span
                  onClick={() => setMode("signup")}
                  className="text-blue-500 cursor-pointer underline"
                >
                  Sign Up
                </span>
              </p>
              <p>
                Forgot your password?{" "}
                <span
                  onClick={() => setMode("forgot")}
                  className="text-blue-500 cursor-pointer underline"
                >
                  Reset
                </span>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setMode("login")}
                className="text-blue-500 cursor-pointer underline"
              >
                Login
              </span>
            </p>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <p>
              Back to login?{" "}
              <span
                onClick={() => setMode("login")}
                className="text-blue-500 cursor-pointer underline"
              >
                Login
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Auth;
