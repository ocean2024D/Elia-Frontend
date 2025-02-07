import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import Joi from "joi";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["authToken"]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    zone: "",
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

  const [errors, setErrors] = useState({});

  // List of Zones
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

  // Joi Validation Schema
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required().messages({
      "string.empty": "Name can not be an empty field",
      "string.min": "Name must be at least 3 characters long",
      "string.max": "Name must be 100 characters at most",
      "any.required": "Name is mandatory",
    }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .required()
      .messages({
        "string.empty": "Email can not be an empty field",
        "string.email": "Email must be valid",
        "any.required": "Email is mandatory",
      }),
    password: Joi.string().trim().min(6).max(36).required().messages({
      "string.empty": "Password can not be an empty field",
      "string.min": "Password should be at least 6 characters",
      "string.max": "Password must be 36 characters at most",
      "any.required": "Password is mandatory",
    }),
    isAdmin: Joi.boolean(),
    zone: Joi.string()
      .valid(...zones)
      .required()
      .messages({
        "string.empty": "Zone field is mandatory",
        "any.only": "Please, select a valid zone",
        "any.required": "Zone field is mandatory",
      }),
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validate Form on Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate with Joi
    const { error } = schema.validate(formData, { abortEarly: false });

    if (error) {
      // Convert Joi errors into a readable format
      const newErrors = {};
      error.details.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors if validation passes

    try {
      const response = await axios.post(
        "http://localhost:8080/api/register",
        formData
      );


      if (response.data.success) {
        setCookie("authToken", response.data.token, { path: "/" });
        toast.success("Registration successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);

      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error has occurred.");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="input-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}

          />
          {errors.name && (
            <p className="error">{errors.name}</p> // Error message below field
          )}
        </div>

        {/* Email */}

        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="error">{errors.email}</p> // Error message below field
          )}
        </div>


        {/* Password */}

        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="error">{errors.password}</p> // Error message below field
          )}
        </div>

        {/* Zone */}
        <div className="input-group">
          <label>Zone:</label>
          <select
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            required>
            <option value="">Select a zone</option>
            {zones.map((zone, index) => (
              <option key={index} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          {errors.zone && (
            <p className="error">{errors.zone}</p> // Error message below field
          )}
        </div>


        {/* Admin Checkbox */}

        <div className="input-group checkbox-group">
          <div className="checkboxGroup">
            <label>Register as Admin</label>
            <input
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit">Register</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Register;
