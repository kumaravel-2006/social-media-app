import { Star } from "lucide-react";
import { assets } from "../assets/assets";
import { SignIn } from "@clerk/react";
const Login = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Background Image */}
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 -z-10 w-full h-full object-cover"
      />

      {/*Left Side : Branding */}

      <div className="flex-1 flex flex-col items-start justify-center p-6 md:p-10 lg:pl-40 relative">
        <img
          src={assets.logo1}
          alt=""
          className="h-20 md:h-24 object-contain absolute top-6 left-6 md:top-10 md:left-10 lg:left-40"
        />
        <div>
          <div className="flex items-center gap-3 mb-4 max-md:mt-10">
            <img src={assets.group_users} alt="" className="h-8 md:h-10"></img>
            <div>
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 md:size-4.5 text transparent fill-amber-500"
                    />
                  ))}
              </div>
              <p>Used By 18k+ Developers</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-6xl md:pb-2 font-bold text-indigo-950">
            It is a great place to Connect
          </h1>
          <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">
            Connect with people around the world on Smedia
          </p>
        </div>
        <span className="md:h-10"></span>
      </div>
      {/* Right Side : Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <SignIn />
      </div>
    </div>
  );
};

export default Login;
