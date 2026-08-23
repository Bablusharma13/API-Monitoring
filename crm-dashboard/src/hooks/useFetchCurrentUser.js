import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";

const useFetchCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CRM_BACKEND}/api/v1/auth/me`,
          {
            withCredentials: true,
          },
        );
        setCurrentUser(response.data.data);
        dispatch(setUser(response.data.data));
      } catch (error) {
        console.error(error);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, [dispatch]);

  return currentUser;
};

export default useFetchCurrentUser;
