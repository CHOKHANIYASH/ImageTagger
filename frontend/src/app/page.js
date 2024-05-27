"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/redux/hooks/index";
export default function Welcome() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);
  const userId = useAppSelector((state) => state.userId);
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("login first", { toastId: "uniqueToast" });
      router.push("/login");
    } else {
      router.push(`/${userId}`);
    }
  }, []);
  return null;
}
