export type MoodType = 
  | "Serene" 
  | "Melancholy" 
  | "Excited" 
  | "Anxious" 
  | "Content" 
  | "Frustrated";

export type PostStatus = "Public" | "Archived";
export type PostPrivacy = "public" | "private";
export type PostType = "text" | "image";

export interface Location {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Post {
  _id: string;
  _creationTime: number;
  userId: string;
  type: PostType;
  content: string;
  mood: MoodType;
  location: Location;
  status: PostStatus;
  privacy: PostPrivacy;
  isHidden: boolean;
  flags: number;
}
