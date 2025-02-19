import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { abbreviateZone } from "../components/utils";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Requests.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Requests = () => {
  const [cookies] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [zoneUsers, setZoneUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [reasonOfExChange, setReasonOfExChange] = useState("");
  const [duties, setDuties] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.id) {
        fetchZoneUsers(parsedUser.zone);
        fetchUserDuties(parsedUser.id);
      } else {
        console.error("User ID is missing!");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    console.log("Fetched Duties for User:", duties);
    duties.forEach((duty) => {
      console.log(
        `Duty for Week ${duty.weekNumber}, originally assigned to ${duty.assignedUser}`
      );
      duty.days.forEach((day) => {
        console.log(
          `- ${day.date} → Assigned User: ${day.assignedUser} (Status: ${day.status})`
        );
      });
    });
  }, [duties]);

  const fetchUserDuties = async (userId) => {
    if (!userId) {
      console.error("fetchUserDuties called with undefined userId!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/duties/${userId}`,
        { headers: { Authorization: `Bearer ${cookies.authToken}` } }
      );

      setDuties(response.data);
    } catch (error) {
      console.error("Error fetching user duties:", error);
    }
  };

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

  const isDayClickable = (date) => {
    return duties.some((duty) =>
      duty.days.some(
        (day) =>
          new Date(day.date).toDateString() === new Date(date).toDateString()
      )
    );
  };

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;

    if (!isDayClickable(clickedDate)) {
      toast.error("You can only select your assigned shifts.");
      return;
    }

    setSelectedDates((prevDates) =>
      prevDates.includes(clickedDate)
        ? prevDates.filter((date) => date !== clickedDate)
        : [...prevDates, clickedDate]
    );
  };

  const handleRequest = async () => {
    if (!user || selectedDates.length === 0) {
      toast.error("Please select at least one date.");
      return;
    }

    try {
      const requestData = {
        requestingUser: user.id, // Include logged-in user ID
        acceptingUser: selectedUser || null, // If null, it's an open request
        status: "pending",
        Days: selectedDates.map((date) => ({
          date,
          requestStartTime: null,
          requestEndTime: null,
          assignedUser: user.id,
          reasonOfChange: reasonOfExChange,
        })),
        reasonOfExChange: reasonOfExChange || "others",
      };

      await axios.post("http://localhost:8080/api/dutyExchange", requestData, {
        headers: { Authorization: `Bearer ${cookies.authToken}` },
      });

      toast.success("Shift change request submitted!");
      setSelectedDates([]);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Try again.");
    }
  };

  return (
    <div className="requests-container">
      {user && (
        <>
          <div className="requests-left">
            <h3>{abbreviateZone(user.zone)}</h3>
          </div>
          <div className="requests-center">
            <h3>{user.name}</h3>
          </div>

          <div className="request-options">
            <h4>Request Shift Change</h4>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Emergency Request (No specific user)</option>
              {zoneUsers
                .filter((zUser) => zUser._id !== user._id)
                .map((zUser) => (
                  <option key={zUser._id} value={zUser._id}>
                    {zUser.name}
                  </option>
                ))}
            </select>
            <select
              value={reasonOfExChange}
              onChange={(e) => setReasonOfExChange(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="sick">Sick</option>
              <option value="vacation">Vacation</option>
              <option value="others">Other</option>
            </select>

            <h4>Select Days for Shift Change</h4>
          </div>

          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              dateClick={handleDateClick}
              events={[
                // ✅ Show shifts where logged-in user is assigned (even if week was assigned to someone else)
                ...duties.flatMap((duty) =>
                  duty.days
                    .filter((day) => day.assignedUser === user.id) // Filter for logged-in user
                    .map((day) => ({
                      title: "Your Shift",
                      start: new Date(day.date).toISOString().split("T")[0],
                      allDay: true,
                      backgroundColor: "green",
                      textColor: "white",
                    }))
                ),
                // ✅ Show selected shift change requests
                ...selectedDates.map((date) => ({
                  title: "Shift Change Request",
                  start: date,
                  allDay: true,
                  backgroundColor: "orange",
                  textColor: "white",
                })),
              ]}
              height={"60vh"}
              headerToolbar={{
                start: "today,prev,next",
                center: "title",
                end: "",
              }}
              weekNumbers={true}
              firstDay={4}
            />
          </div>

          <button onClick={handleRequest} disabled={selectedDates.length === 0}>
            Submit Request
          </button>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default Requests;
