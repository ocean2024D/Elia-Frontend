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
  const [selectedUser, setSelectedUser] = useState(""); // Selected user for request
  const [selectedDates, setSelectedDates] = useState([]); // Selected shift change dates
  const [reasonOfExChange, setReasonOfExChange] = useState("");
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchZoneUsers(parsedUser.zone);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch users in the same zone dynamically
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

  // Handle date selection/deselection
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDates(
      (prevDates) =>
        prevDates.includes(clickedDate)
          ? prevDates.filter((date) => date !== clickedDate) // Remove if already selected
          : [...prevDates, clickedDate] // Add if not selected
    );
  };

  // Submit shift change request
  const handleRequest = async () => {
    if (!user || selectedDates.length === 0) {
      toast.error("Please select at least one date.");
      return;
    }

    try {
      const requestData = {
        requestingUser: user.id,
        acceptingUser: selectedUser || null, // If no user is selected, it's an open request
        status: "pending",
        Days: selectedDates.map((date) => ({
          date,
          requestStartTime: null, // You may want to collect this info
          requestEndTime: null,
          assignedUser: user.id,
          reasonOfChange: reasonOfExChange, // Send correct value
        })),
        reasonOfExChange: reasonOfExChange || "others", // Use selected reason
      };

      await axios.post("http://localhost:8080/api/dutyExchange", requestData, {
        headers: { Authorization: `Bearer ${cookies.authToken}` },
      });

      toast.success("Shift change request submitted!");
      setSelectedDates([]); // Clear selections after submission
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

          {/* Dropdown ABOVE Calendar */}
          <div className="request-options">
            <h4>Request Shift Change</h4>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Emergency Request (No specific user)</option>
              {zoneUsers
                .filter((zUser) => zUser._id !== user.id)
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

          {/* Calendar */}
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              dateClick={handleDateClick}
              events={selectedDates.map((date) => ({
                title: window.innerWidth <= 768 ? "" : "Shift Change",
                start: date,
                allDay: true,
                backgroundColor: "orange",
                textColor: "white",
              }))}
              height={"60vh"}
              headerToolbar={{
                start: "today,prev,next",
                center: "title",
                end: "",
              }}
            />
          </div>

          {/* Submit Request Button */}
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
