"use client";
import React from "react";
// import Link from "next/link";
import { useRouter } from 'next/navigation';
import {redirect} from 'next/navigation';
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "../../utils/cn";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { ToastContainer, toast } from 'react-toastify';
import {useState} from 'react';
import axios from 'axios';
export default function Signup() {
  const router = useRouter();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const notify = () =>toast.success('🦄 Wow so easy!');
  // console.log(process.env.NEXT_PUBLIC_SERVER_DEV_URL);
  const url = process.env.NEXT_PUBLIC_SERVER_DEV_URL;
  // const url = process.env.NEXT_PUBLIC_SERVER_PRODUCTION_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(firstname,lastname,username,email,password);
    try{  
      const response = await axios.post( `${url}/users/signup`, {firstname,lastname,username,email,password});
      // const response = await axios.get( `${url}/images`);
      console.log(response);
      // toast.success(response.data.message);
      setFirstname("");
      setLastname("");
      setUsername("");
      setEmail("");
      setPassword("");
      console.log("Form submitted");
      // redirect("/login")
      router.push("/login");


    }
    catch(err){
      // toast.error(response.data.message);
      console.log(err);
    }

    // notify();
   
  };
  return (
    <>
    <div className="w-full h-20 flex items-center justify-center">
    <ToastContainer autoClose={3000}   />
    </div>
    <div className="max-w-md p-4 m-10 mx-auto bg-white md:w-full max-md:m-5 rounded-2xl md:p-8 shadow-input">
      <h2 className="text-xl font-bold text-neutral-800">
        Welcome 
      </h2>
      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col mb-4 space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input value={firstname} id="firstname" placeholder="Tyler" type="text" onChange={(e) => setFirstname(e.target.value)} />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input value={lastname} id="lastname" placeholder="Durden" type="text" onChange={(e) => setLastname(e.target.value)} />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">username</Label>
          <Input value={username} id="username" placeholder="user1" type="text" onChange={(e) => setUsername(e.target.value)} />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input value={email} id="email" placeholder="projectmayhem@fc.com" type="email" onChange={(e) => setEmail(e.target.value)} />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input value={password} id="password" placeholder="••••••••" type="password" onChange={(e) => setPassword(e.target.value)} />
        </LabelInputContainer>
        <button
          className="bg-gradient-to-br relative group/btn from-black  to-neutral-600 block d w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
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
    </>
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

const LabelInputContainer = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
