import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthMiddleware from "@/components/AuthMiddleware";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gramedia Koperasi",
  description: "Gramedia Koperasi Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        {" "}
        <ReduxProvider>
          {/* AuthMiddleware is an async server component */}
          <AuthMiddleware>{children}</AuthMiddleware>
          <ToastContainer position="bottom-center" />
        </ReduxProvider>
      </body>
    </html>
  );
}
