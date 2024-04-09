
"use client";
import Image from "next/image";
import React from "react";
import { useState } from "react";
import { CardBody, CardContainer, CardItem } from "../../components/ui/card";
import Link from "next/link";

export default function Tag() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploaded, setIsUploaded] = useState(false);
    const handleImageChange = (e) => {
      setSelectedFile(e.target.files[0]);
    };
    const handleSubmit = (e) => {
      e.preventDefault();
      setIsUploaded(true);
    };
    const tags = [1,2,3,4,5,6,7,8,9,10]
  return (
    <>

    <div className='flex justify-center items-center h-[80vh]'>
    <CardContainer className="w-full h-full">
      <CardBody className="relative group/card border-black/[0.1]  rounded-xl p-6 border w-full flex flex-row max-md:flex-col justify-center items-center gap-4 md:gap-20">
        <CardItem translateZ="100" className="mt-4">
          <Image
            src="/img.jpg"
            height="400"
            width="400"
            className="object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <CardItem translateZ="100" className="mt-4">
          <div className="flex flex-col items-center">
          {tags.map((item,i) => (
            <p key={i} className="text-lg font-bold text-white">{`Tag ${i+1}`}</p>
          ))}
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
    </div>
    </>
  );
}
