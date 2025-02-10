import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Home.css";
import { abbreviateZone } from ".././components/utils"; // Import abbreviation function

const Home = () => {
  const [, , removeCookie] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", zone: "" });

  // Fetch user info on page load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    removeCookie("authToken");
    navigate("/login");
  };

  return (
    <>
      <div className="home-container">
        {/* User Info */}
        <div className="top-left">
          <h3>{abbreviateZone(user.zone)}</h3>
        </div>
        <div className="top-center">
          <h3>{user.name}</h3>
        </div>

        <div className="calendar-container">
          <FullCalendar
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
