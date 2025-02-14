import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios here
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Home.css";
import { abbreviateZone } from "../components/utils";

const Home = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", zone: "", _id: "" });
  const [events, setEvents] = useState([]);

  // Fetch user info from localStorage and fetch users from the same zone
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Only set if user data exists
      fetchUsersInSameZone(JSON.parse(storedUser).zone); // Fetch users in the same zone
    } else {
      console.error("User data not found in localStorage");
      navigate("/login"); // Redirect to login if no user data
    }
  }, []);

  // Fetch users from the same zone
  const fetchUsersInSameZone = async (zone) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/auth/user/zone/${encodeURIComponent(zone)}`,
        {
          headers: {
            Authorization: `Bearer ${cookies.authToken}`, // Access token from cookies
          },
        }
      );

      console.log("Users in same zone:", response.data);
      generateShiftEvents(response.data); // Generate shifts after fetching the data
    } catch (error) {
      console.error("Error fetching users in the same zone:", error);
    }
  };

  // Generate shifts for the whole year, rotating users every week
  const generateShiftEvents = (usersInZone) => {
    const shifts = [];
    const year = new Date().getFullYear(); //auto pick current year
    let firstThursday = new Date(year, 0, 1); // Start on Jan 1

    // Move forward until we hit Thursday
    while (firstThursday.getDay() !== 5) {
      firstThursday.setDate(firstThursday.getDate() + 1); // Move to first Thursday of the year
    }

    // Define colors for different users
    const userColors = ["blue", "green", "green", "green", "green", "green"];

    // Generate shifts for 52 weeks (full year)
    for (let week = 0; week < 52; week++) {
      const assignedUser = usersInZone[week % usersInZone.length]; // Rotate users each week
      const userColor = userColors[week % userColors.length]; // Assign different colors

      const weekStart = new Date(firstThursday);
      weekStart.setDate(firstThursday.getDate() + week * 7); // Start on Thursday

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7); // End on Wednesday

      shifts.push({
        title: `On Duty: ${assignedUser.name}`,
        start: weekStart.toISOString().split("T")[0],
        end: weekEnd.toISOString().split("T")[0], // Multi-day event
        allDay: true,
        backgroundColor: assignedUser._id === user._id ? "green" : userColor, // Green for logged-in user
        textColor: "white",
        extendedProps: {
          fontWeight: "bold", // Ensure text is bold
          color: "white",
        },
      });
    }

    setEvents(shifts); // Set the generated shifts in the state
  };

  const handleLogout = () => {
    removeCookie("authToken"); // Correctly remove the auth token
    localStorage.removeItem("user"); // Remove the user from localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="home-container">
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
          firstDay={4} // Thursday as the start of the week
          events={events} // Pass the events to FullCalendar
          eventContent={(eventInfo) => {
            return (
              <div
                style={{
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor: eventInfo.event.backgroundColor,
                  padding: "2px",
                  borderRadius: "5px",
                  textAlign: "center",
                }}>
                {eventInfo.event.title}
              </div>
            );
          }}
        />
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
