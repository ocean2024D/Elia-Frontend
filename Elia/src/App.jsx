import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Requests from "../pages/Requests";
import Admin from "../pages/Admin";
import Overview from "../pages/Overview";
import Contacts from "../pages/Contacts";
import About from "../pages/About";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;
