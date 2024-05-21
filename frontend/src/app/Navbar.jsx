"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem } from "../components/ui/navbarMenu";
import { cn } from "../utils/cn";
import { useAppSelector } from "@/redux/hooks/index";
export default function Navbar({ className }) {
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);
  const userId = useAppSelector((state) => state.userId);
  const [active, setActive] = useState(null);
  return (
    <div className={cn("", className)}>
      <Menu setActive={setActive}>
        <div className="z-10 md:hidden">
          <MenuItem
            setActive={setActive}
            active={active}
            item="menu"
            image="vercel.svg"
          >
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink setActive={setActive} href={`/${userId}`}>
                {" "}
                Home{" "}
              </HoveredLink>
              {/* <a href={`/history/${userId}`}>History</a> */}
              <HoveredLink setActive={setActive} href={`/history/${userId}`}>
                History
              </HoveredLink>
              {!isAuthenticated && (
                <HoveredLink setActive={setActive} href="/login">
                  Login
                </HoveredLink>
              )}
              {!isAuthenticated && (
                <HoveredLink setActive={setActive} href="/signup">
                  Signup
                </HoveredLink>
              )}
              {isAuthenticated && (
                <HoveredLink setActive={setActive} href="/logout">
                  Logout
                </HoveredLink>
              )}
            </div>
          </MenuItem>
        </div>
        <HoveredLink
          setActive={setActive}
          className="max-md:hidden"
          href={`/${userId}`}
        >
          Home
        </HoveredLink>
        <HoveredLink
          setActive={setActive}
          className="max-md:hidden"
          href={`/history/${userId}`}
        >
          History
        </HoveredLink>
        {!isAuthenticated && (
          <>
            <HoveredLink
              setActive={setActive}
              className="max-md:hidden"
              href="/login"
            >
              Login
            </HoveredLink>

            <HoveredLink
              setActive={setActive}
              className="max-md:hidden"
              href="/signup"
            >
              Signup
            </HoveredLink>
          </>
        )}
        {isAuthenticated && (
          <HoveredLink
            setActive={setActive}
            className="max-md:hidden"
            href="/logout"
          >
            Logout
          </HoveredLink>
        )}
      </Menu>
    </div>
  );
}
