
"use client";
import Image from "next/image";
import React from "react";
import { useState } from "react";
import { CardBody, CardContainer, CardItem } from "../components/ui/card";
import Link from "next/link";

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploaded, setIsUploaded] = useState(false);
    const handleImageChange = (e) => {
      setSelectedFile(e.target.files[0]);
    };
    const handleSubmit = (e) => {
      e.preventDefault();
      setIsUploaded(true);
    };
  return (
    <>
    <form className='w-full flex justify-center items-center h-96 mt-20' onSubmit={handleSubmit}>
    <CardContainer className="inter-var ml-5 w-1/2 h-2/3 ">
      <CardBody className="bg-gray-50 relative group/card border-black/[0.1]  rounded-xl p-6 border w-full flex flex-col justify-center items-center">
        <CardItem translateZ="100" className="mt-4">
          <input
            type="file"
            id="imageUpload"
            onChange={handleImageChange}
            accept="*"
            style={{ display: "none" }}
          />
          <label htmlFor="imageUpload">
            <Image
              src="/upload.svg"
              height="100"
              width="100"
              className="object-cover cursor-pointer rounded-xl group-hover/card:shadow-xl"
              alt="thumbnail"
            />
          </label>
        </CardItem>
           <button className="px-4 py-2 mt-10 text-sm font-bold text-white bg-black rounded-xl" type='submit'> 
              Upload
           </button>
      </CardBody>
    </CardContainer>
    </form>
    </>
  );
}
