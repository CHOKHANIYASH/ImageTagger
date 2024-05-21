"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { setAccessToken } from "@/redux/slices/accessTokenSlice";
import { setRefreshToken } from "@/redux/slices/refreshTokenSlice";
import { setUserId } from "@/redux/slices/userIdSlice";
import { setIsAuthenticated } from "@/redux/slices/isAuthenticatedSlice";
import { toast } from "react-toastify";
import ProtectedRoute from "../protectedRoute";
function Logout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const logout = async () => {
        try {
          dispatch(setAccessToken(""));
          dispatch(setRefreshToken(""));
          dispatch(setUserId(""));
          dispatch(setIsAuthenticated(false));
          toast.success("Logout successful", { toastId: "uniqueToastLogout" });
          router.push("/login");
        } catch (error) {
          console.log(error);
          toast.error("Logout failed", { toastId: "uniqueToastLogout" });
        }
      };
      logout();
    }
  }, []);

  return null;
}
export default ProtectedRoute(Logout);
