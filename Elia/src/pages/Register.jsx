import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["authToken"]); // Use setCookie to store JWT
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    zone: "", // New zone field
  });

  const zones = [
    "North-West Lendelede",
    "North-West Lochristi",
    "North-East Merksem",
    "North-East Stalen",
    "North-East Schaarbeek Noord",
    "South-West Gouy",
    "South-West Schaerbeek Sud",
    "South-East Bressoux",
    "South-East Villeroux",
    "South-East Gembloux",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/register",
        formData
      );

      if (data.success && data.token) {
        // Store JWT token in cookies
        setCookie("authToken", data.token, { path: "/", httpOnly: false });

        toast.success("Registration successful! Redirecting to home...");
        setTimeout(() => navigate("/"), 1000); // Redirect to Home page
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Name & Lastname:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Zone:</label>
          <select
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            required>
            <option value="">Select a Zone</option>
            {zones.map((zone, index) => (
              <option key={index} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
            />
            Register as Admin
          </label>
        </div>
        <button type="submit">Register</button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default Register;
