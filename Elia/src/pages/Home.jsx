import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Home.css";
import { abbreviateZone } from "../components/utils";

const Home = () => {
  const [cookies, , removeCookie] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [zoneUsers, setZoneUsers] = useState([]);
  const [duties, setDuties] = useState([]);

  // Fetch user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch users in the same zone when user is available
  useEffect(() => {
    if (user?.zone) {
      fetchZoneUsers(user.zone);
    }
  }, [user]);

  // Fetch duties after zoneUsers are set
  useEffect(() => {
    if (user?.zone && zoneUsers.length > 0) {
      fetchDutiesByZone(user.zone);
    }
  }, [zoneUsers]);

  // Format duties into calendar events
  useEffect(() => {
    if (duties.length > 0 && zoneUsers.length > 0) {
      formatEvents();
    }
  }, [duties, zoneUsers]);

  const fetchZoneUsers = async (zone) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/auth/user/zone/${encodeURIComponent(zone)}`,
        { headers: { Authorization: `Bearer ${cookies.authToken}` } }
      );
      setZoneUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDutiesByZone = async (zone) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/duties/zone/${encodeURIComponent(zone)}`,
        { headers: { Authorization: `Bearer ${cookies.authToken}` } }
      );
      setDuties(response.data);
    } catch (error) {
      console.error("Error fetching duties:", error);
    }
  };

  const formatEvents = () => {
    // Create a map for easy access to user names by their IDs
    const usersMap = zoneUsers.reduce((acc, user) => {
      acc[user._id] = user.name; // Map each user id to their name
      return acc;
    }, {});

    const dutyEvents = duties.flatMap((duty) =>
      duty.days.map((day) => {
        // Check who is assigned to the duty (fall back to duty.assignedUser if day.assignedUser is missing)
        const assignedUserId = day.assignedUser || duty.assignedUser;
        const assignedUserName = usersMap[assignedUserId] || "Unknown";

        // Handle the replacement user if available (fall back to assignedUserId if replacementUserId is missing)
        const actualUserId = day.replacementUserId || assignedUserId;
        const actualUserName = usersMap[actualUserId] || "Unknown";
        //console.log(actualUserName);
        // Default background color is blue (for normal shifts)
        let backgroundColor = "blue";

        // If the actual user is the logged-in user, highlight with green
        if (user && actualUserId === user.id) {
          backgroundColor = "green";
        } else if (day.status === "holiday") {
          backgroundColor = "black";
        }

        // If the status is not "guard", it's a shift change (like sick, on leave, etc.)
        else if (day.status !== "guard") {
          backgroundColor = "red"; // Shift change

          // Adjust the start and end times for the shift based on the date and the 7:30 AM start time
          const shiftStartDate = new Date(day.date);
          const shiftEndDate = new Date(shiftStartDate);
          shiftEndDate.setHours(shiftStartDate.getHours() + 24); // Set to 24 hours after the start time
        }
        return {
          title:
            actualUserId === assignedUserId
              ? ` ${assignedUserName}` // Title if no replacement
              : `Replacement: ${actualUserName}`, // Title if replacement
          start: new Date(day.date).toISOString().split("T")[0], // Format the date to display on the calendar
          allDay: true,
          backgroundColor,
          textColor: "white",
        };
      })
    );

    // Set the events in the state to be displayed in the calendar
    setEvents(dutyEvents);
  };

  const handleLogout = () => {
    removeCookie("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="home-container">
      {user && (
        <>
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
              events={events}
              displayEventTime={true}
              displayEventEnd={true}
              eventContent={(eventInfo) => (
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
              )}
            />
          </div>

          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
};

export default Home;
