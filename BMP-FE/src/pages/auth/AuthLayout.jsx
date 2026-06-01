import { useLocation,useNavigate } from "react-router-dom";
import signupimg from "../../assets/signupimg.png";
import SignupImg1 from "../../assets/SignupImg1.png";
import SignupImg2 from "../../assets/SignupImg2.png";
import RoutePath from "../../core/constants/routes.constant";

const AuthLayout = ({ title,subtitle, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterPage = location.pathname === RoutePath.AUTH_REGISTER;
  const isLoginPage = location.pathname === RoutePath.AUTH_LOGIN;
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden">
        {/* LEFT SIDE */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 flex-col p-8 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(RoutePath.PUBLIC_HOME)}>
            {isLoginPage &&(
              <img src={SignupImg2} className="h-10 w-10" alt="logo" />
            )}
            {isRegisterPage &&(
              <img src={SignupImg1} className="h-10 w-10" alt="logo" />
            )}
            <div className="text-white font-bold">
              <div>Book</div>
              <div className="text-sm">My Parcel</div>
            </div>
          </div>
          {/* Welcome */}
          <h2 className="text-white text-2xl font-semibold">{title}</h2>
          <h3 className="text-base font-medium text-white/85">{subtitle}</h3>
          {/* Image */}
          <img
            src={signupimg}
            alt="signup"
            className="h-100 w-100 mx-auto flex items-center"
          />
         
          {isRegisterPage && (
            <div className="flex items-start gap-3 p-3 mb-2">
              {/* <span className="text-yellow-500 text-lg mt-0.5">ℹ️</span> */}
              <div>
                <p className="text-2xl font-semibold text-white">
                  One Account. Two Roles.
                </p>
                <div className="text-base text-white/85 font-medium mt-0.5 space-y-1">
                  <p>• Send parcels as an Individual</p>
                  <p>• Earn by delivering parcels</p>
                  <p>• Choose your role at login</p>
                </div>
              </div>
            </div>
          )}
        
        </div>
        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

  