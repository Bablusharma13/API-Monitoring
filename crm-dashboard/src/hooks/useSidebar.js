import { useEffect, useState } from "react";
import axios from "axios";
import { useSidebarMenuItems } from "./useSidebarMenuItems";
import useFetchCurrentUser from "./useFetchCurrentUser";

export const useSidebar = () => {
  const [updatedMenuItems, setUpdatedMenuItems] = useState([]);
  const [navbarModules, setNavbarModules] = useState(null);
  const [subMenu, setSubMenu] = useState([]);
  const currentUser = useFetchCurrentUser();
  const { menuItems, loading } = useSidebarMenuItems(currentUser?._id);

  useEffect(() => {
    const fetchCampaignList = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_GLOBAL_MARKETING_BACKEND_API_URL}/admin/get-project`,
          {
            withCredentials: true,
          },
        );
        if (response.status === 200) {
          setSubMenu(response.data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCampaignList();
  }, []);

  useEffect(() => {
    const marketingMenu = menuItems.find(
      (menu) => menu.matcher === "Marketing",
    );

    const dailySendEmail = marketingMenu?.children.find(
      (item) => item.matcher === "Daily Send Emails",
    );

    if (dailySendEmail) {
      // dailySendEmail.children = subMenu.map((project) => ({
      //   title: project.projectName,
      //   matcher: project._id,
      //   href: `${import.meta.env.VITE_GLOBAL_MARKETING_API_URL}/campaign-list/${project.projectName}`,
      // }));

      const newMenuItems = JSON.parse(JSON.stringify(menuItems));
      const updatedMarketingMenu = newMenuItems.find(
        (menu) => menu.matcher === "Marketing",
      );
      if (updatedMarketingMenu) {
        const updatedDailySendEmail = updatedMarketingMenu.children.find(
          (item) => item.matcher === "Daily Send Emails",
        );
        if (updatedDailySendEmail) {
          updatedDailySendEmail.children = dailySendEmail.children;
        }
      }
      setUpdatedMenuItems(newMenuItems);
    } else {
      setUpdatedMenuItems(menuItems);
    }
  }, [menuItems, subMenu]);

  const handleModuleChange = (module) => {
    const selected = updatedMenuItems.find((item) => item.title === module);
    setNavbarModules(selected);
  };

  return {
    updatedMenuItems,
    navbarModules,
    handleModuleChange,
    loading,
  };
  // };
};
