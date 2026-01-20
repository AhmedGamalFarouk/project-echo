"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FeedCard } from "@/components/FeedCard";

export default function Feed() {
  const posts = useQuery(api.posts.list);

  if (posts === undefined) {
    return (
      <div className="w-full max-w-xl mx-auto mt-12 space-y-4 animate-pulse">
         <div className="h-32 bg-white/5 rounded-none border-l-2 border-white/10" />
         <div className="h-32 bg-white/5 rounded-none border-l-2 border-white/10" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto mt-12 text-center text-muted-foreground font-mono text-sm border border-white/5 p-8 border-dashed">
        NO SIGNALS DETECTED.
        <br/>
        BE THE FIRST TO BREAK THE SILENCE.
      </div>
    );
  }

  return (
    <section className="w-full max-w-xl mx-auto mt-12 space-y-6 pb-24">
      <div className="flex items-center space-x-2 mb-6">
        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Live_Feed :: Global_Stream
        </h2>
      </div>

      {posts.map((post) => (
        <FeedCard
          key={post._id}
          city={post.location.city}
          country={post.location.country}
          mood={post.mood}
          content={post.content}
          timestamp={post._creationTime}
        />
      ))}
    </section>
  );
}
