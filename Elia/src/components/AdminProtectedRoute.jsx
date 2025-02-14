import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const AdminProtectedRoute = ({ children }) => {
  const [cookies] = useCookies(["authToken"]);
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (!cookies.authToken || !user || user.isAdmin !== true) {
    console.warn("Unauthorized access - Redirecting to Login"); // Debugging log
    return <Navigate to="/login" />;
  }
  console.log("User Data: ", user);
  console.log("Auth Token: ", cookies.authToken);

  return children;
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminProtectedRoute;
