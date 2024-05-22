"use client";
import Image from "next/image";
import React from "react";
import { useState, useEffect } from "react";
import { CardBody, CardContainer, CardItem } from "../../../components/ui/card";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks/index";
// import { headers } from "next/headers";
export default function Tag() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");
  const image = imageUrl.split("/").pop();
  const [tags, setTags] = useState([]);
  const accessToken = useAppSelector((state) => state.accessToken);
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_SERVER_DEV_URL}/images/labels/${image}`, {
        headers: {
          access_token: `${accessToken}`,
        },
      })
      .then((response) => {
        setTags(response.data.data);
      });
  }, []);
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-20 mt-10 md:flex-row">
        <Image
          src={imageUrl}
          height="400"
          width="400"
          className="object-cover max-sm:p-2 max-sm:rounded-3xl rounded-xl group-hover/card:shadow-xl"
          alt="thumbnail"
        />
        <div className="flex flex-col items-center">
          <ul className="list-disc">
            {tags &&
              tags.map((item, i) => (
                <li
                  key={i}
                  className="p-2 font-bold text-white test-md md:text-lg"
                >
                  {item.Name}
                  <br />
                  {item.Confidence} %
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
