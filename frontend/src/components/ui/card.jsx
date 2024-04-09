"use client";

import { cn } from "../../utils/cn";
import Image from "next/image";
import React, {
  createContext,
  useRef,
} from "react";

const MouseEnterContext = createContext(
    undefined
  );
  
export const CardContainer = ({
  children,
  className,
  containerClassName,
}) => {
  const containerRef = useRef(null);
  return (
        <div
          ref={containerRef}
          className={cn(
            "flex relative transition-all duration-200 ease-linear",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
  );
};

export const CardBody = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) => {
  const ref = useRef(null);
  return (
    <Tag
      ref={ref}
      className={cn("w-fit transition duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};