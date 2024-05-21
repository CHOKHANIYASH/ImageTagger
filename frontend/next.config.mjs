/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "yash-image-tagger-resized.s3.ap-south-1.amazonaws.com",
      "yash-image-tagger-resized.s3.amazonaws.com",
    ],
  },
};

export default nextConfig;
