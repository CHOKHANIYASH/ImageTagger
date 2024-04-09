"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "../../components/ui/card";
import Link from "next/link";

export default function History() {
    const history = [1,2,3,4,5,6,7,8,9,10]
  return (
    <>
    <div className='grid grid-cols-1 gap-4 m-6 md:grid-cols-4 md:gap-10 md:m-10'>
    {   history.map((item,i) => (
    <CardContainer className="inter-var mt-10 ml-5">
      <CardBody className="bg-gray-50 relative group/card border-black/[0.1]  rounded-xl p-6 border  ">
        <CardItem
          translateZ="50"
          className="text-lg font-bold text-neutral-600"
        >
          {`Image ${i+1}`}
        </CardItem>
        <CardItem translateZ="100" className="mt-4">
          <Image
            src="/img.jpg"
            height="250"
            width="250"
            className="object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex items-center mt-10">
          <CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 text-xs font-bold text-white bg-black rounded-xl"
          >
            Get Tags
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
    ))}
    </div>
    </>
  );
}
