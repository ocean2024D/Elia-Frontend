import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { abbreviateZone } from "../../components/utils/utils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css";

const Home = () => {
  const [cookies, , removeCookie] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [zoneUsers, setZoneUsers] = useState([]);
  const [duties, setDuties] = useState([]);
  const [shiftRequests, setShiftRequests] = useState([]);

  const fetchShiftRequests = async (userId, userZone) => {
    // with use of local storage
    try {
      const response = await axios.get(
        `http://localhost:8080/api/dutyExchange`,
        { headers: { Authorization: `Bearer ${cookies.authToken}` } }
      );

      let allRequests = response.data;

      //  Fetch users in the same zone from localStorage
      const zoneUsers = JSON.parse(localStorage.getItem("zoneUsers")) || [];

      //  Filter requests: Keep only those where `requestingUser` is in the same zone
      let filteredRequests = allRequests.filter((request) =>
        zoneUsers.some((zUser) => zUser._id === request.requestingUser?._id)
      );

      //  Ensure each `Day` in a request has an `acceptingUser` displayed
      filteredRequests = filteredRequests.map((request) => ({
        ...request,
        Days: request.Days.map((day) => ({
          ...day,
          acceptingUser:
            zoneUsers.find((user) => user._id === day.acceptingUser)?.name ||
            "Pending", //  Converts ID to name
        })),
      }));

      setShiftRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching shift change requests:", error);
    }
  };

  // Fetch shift requests when user logs in
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id && storedUser?.zone) {
      fetchShiftRequests(storedUser.id, storedUser.zone);
    }
  }, []);

  useEffect(() => {}, [shiftRequests]);

  // Fetch shift requests when user logs in
  useEffect(() => {
    if (user?.zone) {
      fetchShiftRequests(user.zone, user.id);
    }
  }, [user]);

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

      // Save to localStorage so we can use it for filtering
      localStorage.setItem("zoneUsers", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch users in the same zone when user is available
  useEffect(() => {
    if (user?.zone) {
      fetchZoneUsers(user.zone);
    }
  }, [user]);

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
      // build an object where key = user._id and value = user.name
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
        if (user && actualUserId === user.id && day.status === "guard") {
          backgroundColor = "green";
        } else if (day.status === "vacation") {
          backgroundColor = "black";
        } else if (day.status === "others") {
          backgroundColor = "orange";
        } else if (day.status !== "guard") {
          backgroundColor = "red";
          // This needs to be added with start and end hours
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

  const handleEventClick = async (clickInfo) => {
    console.log("handleEventClick triggered:", clickInfo);
    const clickedDate = clickInfo.event.startStr;
    console.log("Clicked date:", clickedDate);

    // Find the corresponding request
    const selectedRequest = shiftRequests.find((request) =>
      request.Days.some(
        (day) => new Date(day.date).toISOString().split("T")[0] === clickedDate
      )
    );
    console.log("Selected request:", selectedRequest);

    if (!selectedRequest) {
      toast.error("No matching shift request found.");
      return;
    }

    // Prevent the requesting user from accepting their own request
    if (selectedRequest.requestingUser._id === user.id) {
      toast.error("You cannot accept your own shift change request.");
      return;
    }

    // Ensure the user has permission to accept the request
    if (selectedRequest.acceptingUser) {
      toast.error("This shift change request has already been accepted.");
      return;
    }

    const accept = window.confirm(
      `Do you want to accept this shift change request from ${selectedRequest.requestingUser.name}?`
    );

    if (!accept) {
      toast.info("Shift change request was not accepted.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/dutyExchange/accept/${selectedRequest._id}`,
        { acceptingUser: user.id },
        { headers: { Authorization: `Bearer ${cookies.authToken}` } }
      );

      toast.success(`Shift change request accepted successfully!`);
      fetchShiftRequests(user.zone, user.id); // Refresh shift requests
    } catch (error) {
      console.error("Error updating shift request:", error);
      toast.error("Failed to update shift request.");
    }
  };

  //Abbreviation needed when making a request to be accepted for space issue
  const abbreviateName = (fullName) => {
    if (!fullName) return "Unknown";
    const parts = fullName.split(" ");
    if (parts.length === 2)
      return `${parts[0].slice(0, 3)} ${parts[1].slice(0, 3)}`; // Abc Abc for a first and last name
    if (parts.length > 2)
      return parts
        .map((p) => p.charAt(0))
        .join("")
        .toUpperCase(); // ABC... for more than 2 partition of name
    return fullName; // If only one name, return as is
  };
  const reasonColors = {
    //color scheme for shift changes
    sick: "red",
    vacation: "black",
    others: "orange",
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
              events={[
                ...events, // Keeps existing duty shifts
                ...shiftRequests
                  .flatMap((request) =>
                    request.Days.map((day) => {
                      if (!day.date || isNaN(new Date(day.date))) {
                        console.warn("Invalid date found:", day);
                        return null;
                      }

                      return {
                        //populating the shift by commenting who gets replaced by who + change bg with appropriate color
                        title:
                          request.status === "accepted"
                            ? `Accepted: ${abbreviateName(
                                request.requestingUser?.name
                              )} → ${abbreviateName(
                                request.acceptingUser?.name
                              )}`
                            : `Pending: ${abbreviateName(
                                request.requestingUser?.name
                              )}`,
                        start: new Date(day.date).toISOString().split("T")[0],
                        allDay: true,
                        backgroundColor:
                          request.status === "accepted"
                            ? reasonColors[day.reasonOfChange] || "gray"
                            : "maroon", // Maroon for pending, color-coded for accepted
                        textColor: "white",
                      };
                    })
                  )
                  .filter(Boolean),
              ]}
              displayEventTime={false}
              eventClick={handleEventClick}
            />
          </div>

          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
};

export default Home;
