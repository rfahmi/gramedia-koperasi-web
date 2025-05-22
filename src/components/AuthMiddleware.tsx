"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, setUserData } from "@/configs/redux/authSlice";
import { RootState } from "@/configs/redux/store";

const publicPaths = ["/login"]; // Add any other public paths here

export default function AuthMiddleware({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.authenticated
  );

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");

      if (token) {
        const userData = {
          nama: localStorage.getItem("nama"),
          nik: localStorage.getItem("nik"),
          noba: localStorage.getItem("noba"),
          pin: localStorage.getItem("pin")
            ? parseInt(localStorage.getItem("pin")!)
            : null,
          role: localStorage.getItem("role") as "NASABAH" | "ADMIN" | null,
        };

        dispatch(setUserData(userData));
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
        dispatch(
          setUserData({
            nama: null,
            nik: null,
            noba: null,
            pin: null,
            role: null,
          })
        );
      }

      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const currentPath = pathname.toLowerCase();

    // Only redirect if we're not already at the target destination
    if (!isAuthenticated && !publicPaths.includes(currentPath)) {
      router.replace("/login");
    } else if (isAuthenticated && currentPath === "/login") {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  if (!isInitialized) {
    return null;
  }

  return children;
}
