"use client";
import Image from "next/image";
import { Box, Center } from "@chakra-ui/react";
import { useState } from "react";
export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <Center h="100vh">
        <Box
          className="bg-white shadow-xl shadow-gray-500 flex flex-col items-center justify-center font-bold text-xl text-blue-500"
          w="50%"
          h="200px"
          rounded="md"
        >
          <form onSubmit={handleSubmit}>
            <label htmlFor="imageUpload">
              <Image
                width="100"
                height="100"
                src="/upload.svg"
                alt="Upload"
                className="cursor-pointer pb-4"
              />
            </label>
            <input
              type="file"
              id="imageUpload"
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <div className="text-sm text-black">
              {selectedFile && <p>Selected file: {selectedFile.name}</p>}
            </div>
            <button type="submit">Upload Image</button>
          </form>
        </Box>
      </Center>
    </>
  );
}
