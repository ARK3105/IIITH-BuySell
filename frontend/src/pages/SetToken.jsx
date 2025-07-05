import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SetToken() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
 
    if (token) {
      localStorage.setItem("token", token);
      navigate("/Profile"); 
    } else {
      console.error("Token not found in URL");
    }
  }, [history]);

  return <div>Setting token...</div>;
}

export default SetToken;