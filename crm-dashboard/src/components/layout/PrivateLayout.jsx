import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";
import { IntitialLoader } from "../ui/InitialLoader";

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CRM_BACKEND}/api/v1/auth/me`,
          {
            withCredentials: true,
          },
        );
        dispatch(setUser(response?.data?.data || null));
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [dispatch, navigate]);

  if (loading) {
    return <IntitialLoader text="Loading dashboard…" />;
  }
  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
};

export default PrivateRoute;
