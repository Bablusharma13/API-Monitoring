import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setProfileSettingItems } from "../redux/slices/navbarSettingsSlice";

export const useSidebarMenuItems = (userId) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSidebarMenuItems = async (userId) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_GLOBAL_AUTH_BACKEND
          }/api/menu/get-menu-based-on-permissions/${userId}`,
          { withCredentials: true },
        );
        const profileSettings = response.data.profileSettingItems || [];

        if (response.status === 200) {
          setMenuItems(response.data.allMenuItems);
          dispatch(setProfileSettingItems(profileSettings));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchSidebarMenuItems(userId);
    }
  }, [userId]);

  return { menuItems, loading };
};
