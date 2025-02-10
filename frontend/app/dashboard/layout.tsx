"use client"

import { UserContextProvider } from "../context/userContext";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {




    return (
        <UserContextProvider>
            <div
              className={`h-full`}
            >
              {children}
            </div>
         

        </UserContextProvider>
  );
}
