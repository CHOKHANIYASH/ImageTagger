import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks/index";
import jwt from "jsonwebtoken";
import axios from "axios";
import { setIsAuthenticated } from "@/redux/slices/isAuthenticatedSlice";
import { setAccessToken } from "@/redux/slices/accessTokenSlice";
import { toast } from "react-toastify";
import { IconMapPinQuestion } from "@tabler/icons-react";
export default function ProtectedRoute(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.isAuthenticated);
    const accessToken = useAppSelector((state) => state.accessToken);
    const refreshToken = useAppSelector((state) => state.refreshToken);
    const url = process.env.NEXT_PUBLIC_SERVER_DEV_URL;
    useEffect(() => {
      if (!isAuthenticated) {
        toast.error("Please login first", { toastId: "uniqueToast" });
        router.push("/login");
      } else {
        if (accessToken === "") dispatch(setIsAuthenticated(false));
        const decodedToken = jwt.decode(accessToken, { complete: true });
        if (decodedToken.payload.exp < Date.now() / 1000) {
          axios
            .post(`${url}/users/accesstoken`, {
              refreshToken,
              username: decodedToken.payload.username,
            })
            .then((response) => {
              dispatch(setAccessToken(response.data.data.AccessToken));
            })
            .catch((err) => {
              console.log(err);
              dispatch(setIsAuthenticated(false));
            });
        }
      }
    }, []);
    return <Component {...props} />;
  };
}
