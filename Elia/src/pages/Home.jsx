import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import dayGrid plugin
import "./Home.css";

const Home = () => {
  const [, , removeCookie] = useCookies(["authToken"]);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeCookie("authToken"); // Remove authentication cookie
    navigate("/login"); // Redirect to login page
  };

  return (
    <>
      <div className="home-container">
        <div className="calendar-container">
          {/* FullCalendar component */}
          <FullCalendar
            plugins={[dayGridPlugin]} // Add the dayGrid plugin
            initialView="dayGridMonth" // Initial view for the calendar (month view)
          />
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
};

export default Home;
