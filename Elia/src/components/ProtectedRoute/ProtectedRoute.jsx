import PropTypes from "prop-types"; // Import PropTypes
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const ProtectedRoute = ({ children }) => {
  const [cookies] = useCookies(["authToken"]);

  if (!cookies.authToken) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Add prop validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
