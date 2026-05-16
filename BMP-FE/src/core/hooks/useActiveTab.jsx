import { useLocation } from "react-router-dom";
import RoutePath from "../constants/routes.constant";

export const useActiveTab = () => {
  const location = useLocation();
  const pathToTab = {
    [RoutePath.USER_ALL_ORDERS]: "all",
    [RoutePath.USER_ACTIVE]: "active",
    [RoutePath.USER_COMPLETED]: "completed",
    [RoutePath.USER_CANCELLED]: "cancelled",
  };
  return pathToTab[location.pathname] || "all";
};
