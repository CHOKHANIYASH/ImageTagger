"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "../../../components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/protectedRoute";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { userId } from "@/redux/slices/userIdSlice";
function History() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const isAuthenticated = useAppSelector((state) => state.isAuthenticated);
  const accessToken = useAppSelector((state) => state.accessToken);
  const userId = useAppSelector((state) => state.userId);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const response = axios
      .get(
        `${process.env.NEXT_PUBLIC_SERVER_DEV_URL}/users/${userId}/imageurls`,
        {
          headers: {
            access_token: `${accessToken}`,
          },
        }
      )
      .then((response) => {
        setHistory(response.data.data.imageUrls);
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const imageUrl =
    "https://yash-image-tagger-resized.s3.ap-south-1.amazonaws.com/github-photo200.jpeg  ";
  return (
    <>
      <div className="grid grid-cols-1 gap-4 m-6 md:grid-cols-4 md:gap-10 md:m-10">
        {history.length !== 0 &&
          history.toReversed().map((item, i) => (
            <CardContainer key={i} className="mt-10 ml-5 inter-var">
              <CardBody className="bg-gray-50 relative group/card border-black/[0.1]  rounded-xl p-6 border  ">
                <CardItem
                  translateZ="50"
                  className="text-lg font-bold text-neutral-600"
                >
                  {`Image ${i + 1}`}
                </CardItem>
                <CardItem translateZ="100" className="mt-4">
                  <Image
                    src={item}
                    height="250"
                    width="250"
                    className="object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                  />
                </CardItem>
                <div className="flex flex-row items-center justify-between mt-10">
                  <Link
                    href={`/images/tags?imageUrl=${item}`}
                    className="px-4 py-2 text-xs font-bold text-white bg-black rounded-xl"
                  >
                    Get Tags
                  </Link>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        {history.length === 0 && (
          <h1 className="text-2xl font-bold text-neutral-800">
            No images uploaded yet
          </h1>
        )}
      </div>
    </>
  );
}

export default ProtectedRoute(History);
