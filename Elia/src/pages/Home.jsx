import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import dayGrid plugin
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
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
            className="calendar"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              start: "today,prev,next",
              center: "title",
              end: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height={"70vh"}
            weekNumbers={true}
            firstDay={4}
          />
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
};

export default Home;
