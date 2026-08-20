import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";
import { Suspense } from "react";

export default function Home({ initialVideos }: { initialVideos: any[] }) {
  return (
    <main className="flex-1 p-4">
      <CategoryTabs />
      <Suspense fallback={<div>Loading videos...</div>}>
        <Videogrid initialVideos={initialVideos} />
      </Suspense>
    </main>
  );
}

export async function getStaticProps() {
  try {
    // Next.js ISR: Fetch at build time, cache on edge, regenerate in background
    const res = await fetch("https://youtube-4mgi.onrender.com/video/getall");
    const initialVideos = await res.json();
    return {
      props: { initialVideos: Array.isArray(initialVideos) ? initialVideos : [] },
      revalidate: 60,
    };
  } catch (err) {
    return { props: { initialVideos: [] }, revalidate: 60 };
  }
}
