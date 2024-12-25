import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-between p-4 sm:p-6 sm:px-24 absolute top-0 left-0">
      <img
        src={assets.logop}
        alt="Logo of the Project"
        className="w-28 sm:w-32"
      />
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-2  border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
      >
        Login
        <img src={assets.arrow_icon} alt="Arrow icon" />
      </button>
    </div>
  );
};

export default Navbar;
