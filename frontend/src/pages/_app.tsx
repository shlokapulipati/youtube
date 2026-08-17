import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import React, { useState } from "react";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <UserProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <title>You-Tube Clone</title>
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Toaster />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar isOpen={isSidebarOpen} />
          <main className="flex-1 overflow-y-auto">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
