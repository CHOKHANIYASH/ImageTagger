"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function Welcome() {
  const router = useRouter();
  toast.error("Pls login first", { toastId: "uniqueToast" });
  router.push("/login");
  return null;
}
