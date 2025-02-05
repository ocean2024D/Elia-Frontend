import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [, , removeCookie] = useCookies(["authToken"]); // [cookies, setCookies, removeCookies] we are never using the first 2, i deleted them to have a clean code
  const navigate = useNavigate();

  const handleLogout = () => {
    removeCookie("authToken"); // Remove authentication cookie
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="home-container">
      <h2>Welcome to the Home Page!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
