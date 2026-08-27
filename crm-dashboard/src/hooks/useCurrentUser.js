import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/userSlice";

const useCurrentUser = () => {
  const user = useSelector(selectUser);

  return {
    email: user?.email ?? null,
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
  };
};

export default useCurrentUser;
