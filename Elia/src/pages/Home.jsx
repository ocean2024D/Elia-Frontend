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
  const [cookies, , removeCookie] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", zone: "", _id: "" });
  const [events, setEvents] = useState([]);
  const [zoneUsers, setZoneUsers] = useState([]); // State to hold users in the same zone

  // Fetch user info from localStorage and then fetch duties
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchZoneUsers(parsedUser.zone); // Fetch users in the same zone
      fetchDutiesByZone(parsedUser.zone); // Fetch duties for the logged-in user's zone
    } else {
      console.error("User data not found in localStorage");
      navigate("/login");
    }
  }, []);

  // Fetch users in the same zone as the logged-in user
  const fetchZoneUsers = async (zone) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/auth/user/zone/${encodeURIComponent(zone)}`,
        {
          headers: { Authorization: `Bearer ${cookies.authToken}` },
        }
      );

      console.log("Fetched users in the same zone:", response.data);
      setZoneUsers(response.data); // Store the users in the zoneUsers state
    } catch (error) {
      console.error("Error fetching users in the same zone:", error);
    }
  };

  // Fetch duties from the same zone
  const fetchDutiesByZone = async (zone) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/duties/zone/${encodeURIComponent(zone)}`,
        {
          headers: {
            Authorization: `Bearer ${cookies.authToken}`,
          },
        }
      );

      console.log("Fetched duties in same zone:", response.data);
      formatEvents(response.data);
    } catch (error) {
      console.error("Error fetching duties by zone:", error);
    }
  };

  // Format duties into events for FullCalendar
  const formatEvents = async (duties) => {
    try {
      const users = zoneUsers.reduce((acc, user) => {
        acc[user._id] = user.name; // Map userId -> name from users in the same zone
        return acc;
      }, {});

      const dutyEvents = duties.flatMap((duty) => {
        return duty.days.map((day) => {
          const assignedUserId = duty.assignedUser; // Assigned user ID from the duty
          const assignedUserName = users[assignedUserId] || "Unknown"; // Get the name from the users list

          // Check if a replacement is present
          const actualUserId = day.replacementUserId || assignedUserId;
          const actualUserName = users[actualUserId] || "Unknown";

          // Determine the background color
          let backgroundColor = "blue"; // Default color
          if (actualUserId === user._id) {
            backgroundColor = "green"; // Logged-in user's duty
          } else if (actualUserId !== assignedUserId) {
            backgroundColor = "red"; // Replacement duty
          }

          return {
            title:
              actualUserId === assignedUserId
                ? `On Duty: ${assignedUserName}`
                : `Replacement: ${actualUserName}`, // Show replacement if applicable
            start: new Date(day.date).toISOString().split("T")[0], // Single day event
            allDay: true,
            backgroundColor,
            textColor: "white",
          };
        });
      });

      setEvents(dutyEvents);
    } catch (error) {
      console.error("Error formatting events:", error);
    }
  };

  const handleLogout = () => {
    removeCookie("authToken");
    localStorage.removeItem("user");
    navigate("/login");
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
