import { assets } from "../assets/assets";
const Login = () => {
  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* Background Image */}
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 -z-1 w-full h-full object-cover"
      />
    </div>
  );
};

export default Login;

console.log(assets);
