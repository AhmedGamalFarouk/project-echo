"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FeedCard } from "./FeedCard";
import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import ShinyText from "@/shared/components/ShinyText";

export default function Feed() {
  const posts = useQuery(api.posts.list);
  const [newPostCount, setNewPostCount] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const knownPostIdsRef = useRef<Set<string>>(new Set());

  // Track new posts arriving in real-time
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    // Initialize known posts on first load
    if (knownPostIdsRef.current.size === 0) {
      knownPostIdsRef.current = new Set(posts.map(p => p._id));
      return;
    }

    // Check for new posts
    const currentIds = new Set(posts.map(p => p._id));
    const newPosts = posts.filter(p => !knownPostIdsRef.current.has(p._id));

    if (newPosts.length > 0) {
      setNewPostCount(prev => prev + newPosts.length);
    }
  }, [posts]);

  const loadNewPosts = () => {
    if (posts) {
      // Update known posts
      knownPostIdsRef.current = new Set(posts.map(p => p._id));
      setNewPostCount(0);
      // Smooth scroll to top
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (posts === undefined) {
    return (
      <div className="w-full h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="space-y-4 animate-pulse text-center">
          <div className="h-1 w-32 bg-white/20 mx-auto" />
          <div className="font-mono text-xs text-muted-foreground tracking-widest">
            LOADING ECHOES...
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="max-w-md text-center text-muted-foreground font-mono text-sm p-8 bg-black/20">
          <ShinyText text="BE THE FIRST TO SPEEK YOUR MIND." disabled={false} speed={3} className="text-sm" />
        </div>
      </div>
    );
  }

  return (
    <section ref={scrollContainerRef} className="w-full h-[calc(100vh-6rem)] overflow-y-scroll snap-y snap-mandatory scroll-smooth relative">
      {/* New Posts Notification Banner */}
      {newPostCount > 0 && (
        <div className="sticky top-4 z-50 flex justify-center pointer-events-none">
          <button
            onClick={loadNewPosts}
            className="pointer-events-auto glass-panel px-4 py-2 rounded-none border border-primary/50 
                     hover:border-primary hover:bg-primary/10 transition-all duration-300
                     animate-in slide-in-from-top-4 fade-in
                     flex items-center gap-2 group"
          >
            <ArrowUp className="h-3 w-3 group-hover:animate-bounce" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {newPostCount} New Echo{newPostCount > 1 ? 's' : ''}
            </span>
          </button>
        </div>
      )}

      {posts.map((post, index) => (
        <FeedCard
          key={post._id}
          city={post.location.city}
          country={post.location.country}
          mood={post.mood}
          content={post.content}
          timestamp={post._creationTime}
          index={index}
        />
      ))}
    </section>
  );
}
