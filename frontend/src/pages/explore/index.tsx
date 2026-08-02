import React from "react";
import Videogrid from "@/components/Videogrid";

export default function Explore() {
  return (
    <div className="flex-1 mt-16 p-4 ml-0 sm:ml-20 md:ml-64">
      <h2 className="text-xl font-bold mb-4">Explore Trending Videos</h2>
      <Videogrid />
    </div>
  );
}
