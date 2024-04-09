
"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../components/ui/navbarMenu";
import { cn } from "../utils/cn";

export default function Navbar({ className }) {
  const [active, setActive] = useState(null);
  return (
    <div
      className={cn("", className)}
    >
      <Menu setActive={setActive}>
        <div className="md:hidden z-10">
        <MenuItem  setActive={setActive} active={active} item="menu" image="vercel.svg">
          <div className="flex flex-col space-y-4 text-sm">
          <HoveredLink href="/dashboard">Dashboard</HoveredLink>
            <HoveredLink href="/">Home</HoveredLink>
            <HoveredLink href="/history">History</HoveredLink>
            <HoveredLink href="/login">Login</HoveredLink>
            <HoveredLink href="/signup">Signup</HoveredLink>
          </div>
        </MenuItem>
        </div>
            <HoveredLink className='max-md:hidden' href="/dashboard">Dashboard</HoveredLink>
            <HoveredLink className='max-md:hidden' href="/">Home</HoveredLink>
            <HoveredLink className='max-md:hidden' href="/history">History</HoveredLink>
            <HoveredLink className='max-md:hidden' href="/login">Login</HoveredLink>
            <HoveredLink className='max-md:hidden' href="/signup">Signup</HoveredLink>
      </Menu>
    </div>
  );
}
