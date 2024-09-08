"use client";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "../../utils/cn";
import { IconBrandGoogle } from "@tabler/icons-react";
import Loader from "react-js-loader";
import jwt from "jsonwebtoken";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "@/redux/hooks/index";
import { setAccessToken } from "@/redux/slices/accessTokenSlice";
import { setIsAuthenticated } from "@/redux/slices/isAuthenticatedSlice";
import { setUserId } from "@/redux/slices/userIdSlice";
import { setRefreshToken } from "@/redux/slices/refreshTokenSlice";
export default function Login() {
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);
  const accessToken = useAppSelector((state) => state.accessToken);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const url = process.env.NEXT_PUBLIC_SERVER_DEV_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Form submitted");
      const response = await axios.post(`${url}/users/login`, {
        username,
        password,
      });
      setUsername("");
      setPassword("");

      const tokenDecoded = jwt.decode(
        response.data.data.Authentication.AccessToken,
        { complete: true }
      );
      const userId = tokenDecoded.payload.sub;
      dispatch(setAccessToken(response.data.data.Authentication.AccessToken));
      dispatch(setRefreshToken(response.data.data.Authentication.RefreshToken));
      dispatch(setIsAuthenticated(true));
      dispatch(setUserId(userId));
      toast.success("Login successful", { toastId: "uniqueToastLogin" });
      setLoading(false);
      router.push(`/${userId}`);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message, { toastId: "uniqueToastLogin" });
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md p-4 m-10 mx-auto bg-white md:w-full max-md:m-5 rounded-2xl md:p-8 shadow-input">
      <h2 className="text-xl font-bold text-neutral-800">Welcome</h2>
      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username </Label>
          <Input
            id="username"
            value={username}
            placeholder="user1"
            type="username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            value={password}
            id="password"
            placeholder="••••••••"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </LabelInputContainer>
        {!loading ? (
          <button
            className="bg-gradient-to-br relative group/btn from-black  to-neutral-600 block d w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
            type="submit"
          >
            Login &rarr;
            <BottomGradient />
          </button>
        ) : (
          <Loader type="spinner-circle" bgColor={"#000000"} size={50} />
        )}
        <button
          className="relative block h-10 p-2 mt-2 ml-auto font-medium text-white bg-blue-500 rounded-full bg-gradient-to-br group/btn"
          onClick={(e) => {
            setUsername("testuser");
            setPassword("Test#1234");
          }}
          type="submit"
        >
          Guest
        </button>
        <div className="bg-gradient-to-r from-transparent via-neutral-300  to-transparent my-8 h-[1px] w-full" />

        {/* <div className="flex flex-col space-y-4">
          <button
            className="relative flex items-center justify-start w-full h-10 px-4 space-x-2 font-medium text-black rounded-md group/btn shadow-input bg-gray-50"
            type="submit"
          >
            <IconBrandGoogle className="w-4 h-4 text-neutral-800" />
            <span className="text-sm text-neutral-700">
              Google
            </span>
            <BottomGradient />
          </button>
        </div> */}
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 block w-full h-px transition duration-500 opacity-0 group-hover/btn:opacity-100 -bottom-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="absolute block w-1/2 h-px mx-auto transition duration-500 opacity-0 group-hover/btn:opacity-100 blur-sm -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
