import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styling/ProfilePage.css";

const token = localStorage.getItem("token");


const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [message, setMessage] = useState("");

  
  const getEmailFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.email;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

 
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const email = getEmailFromToken();
        if (!email) throw new Error("No email found in token");
  
        const response = await axios.get(
          `http://localhost:5688/users/profile?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setUserData(response.data);
        setEditableData(response.data);
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditableData({ ...userData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableData(userData);
    setError(null);
    setMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const email = getEmailFromToken();
      const response = await axios.put(
        "http://localhost:5688/users/profile",
        editableData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserData(response.data);
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="profile-card">
        {isEditing ? (
          <div>
            <input
              name="firstName"
              value={editableData.firstName}
              onChange={handleInputChange}
            />
            <input
              name="lastName"
              value={editableData.lastName}
              onChange={handleInputChange}
            />
            <input
              name="age"
              value={editableData.age}
              onChange={handleInputChange}
            />
            <input
              name="contactNumber"
              value={editableData.contactNumber}
              onChange={handleInputChange}
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <div>
            <p>Name: {userData.firstName} {userData.lastName}</p>
            <p>Email: {userData.email}</p>
            <p>Age: {userData.age}</p>
            <p>Contact: {userData.contactNumber}</p>
            <button onClick={handleEdit}>Edit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
