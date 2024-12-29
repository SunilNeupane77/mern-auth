import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

    const logOut=async ()=>{
      try {
        axios.defaults.withCredentials=true
        const {data}=await axios.post(backendUrl+'/api/auth/logout')
        if(data.success && setIsLoggedIn(false)){
          data.success && setUserData(false)
          navigate("/")
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  return (
    <div className="w-full flex justify-between p-4 sm:p-6 sm:px-24 absolute top-0 left-0">
      <img
        src={assets.logop}
        alt="Logo of the Project"
        className="w-28 sm:w-32"
      />
      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded p-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {! userData.isverified && (
                <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer">
                  Verify Email
                </li>
              )}
              <li onClick={logOut} className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2  border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login
          <img src={assets.arrow_icon} alt="Arrow icon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
