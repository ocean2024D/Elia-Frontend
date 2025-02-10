import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const [, setCookie] = useCookies(["authToken"]); // Use cookies to store auth token [cookies, setCookies] cookies never read so i deleted for clean code
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/login",
        values,
        { withCredentials: true }
      );
      console.log("login response: ", data); //view debug where name is undefined

      if (data.errors) {
        if (data.errors.email) toast.error(data.errors.email);
        if (data.errors.password) toast.error(data.errors.password);
      } else {
        toast.success("Login Successful!");

        // Store authentication in a cookie
        setCookie("authToken", data.token, { path: "/" });

        // Store user details in localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          console.error("User data missing from response");
        }

        // Redirect to home
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
            required
          />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
            required
          />
        </div>

        <button type="submit">Login</button>

        <Link to="/register">
          <p className="registerLink">Not a user yet? Click Here</p>
        </Link>
      </form>

      <ToastContainer />
    </div>
  );
};

export default Login;
