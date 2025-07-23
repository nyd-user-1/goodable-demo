import { useLocation } from "react-router-dom";

export const useNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard" && currentPath === "/dashboard") return true;
    if (path === "/home" && currentPath === "/home") return true;
    if (path !== "/" && path !== "/dashboard" && path !== "/home" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-muted text-foreground font-medium" 
      : "hover:bg-muted hover:text-foreground";
  };

  return {
    currentPath,
    isActive,
    getNavClassName,
  };
};