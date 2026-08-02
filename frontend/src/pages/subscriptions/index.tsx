import React from "react";
import Videogrid from "@/components/Videogrid";

export default function Subscriptions() {
  return (
    <div className="flex-1 mt-16 p-4 ml-0 sm:ml-20 md:ml-64">
      <h2 className="text-xl font-bold mb-4">Latest from your Subscriptions</h2>
      <Videogrid />
    </div>
  );
}
