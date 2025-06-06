// app/types/post.ts

import { Timestamp } from "firebase/firestore";

// Tipos de comentarios raw (Firestore)
export type ComentRaw = {
  userId: string;
  coment: string;
  createdAt: string | Timestamp | Date;
};

// Comentario con ID y fecha como Date
export type ComentData = {
  id: string;
  userId: string;
  coment: string;
  createdAt: Date;
  replys?: {
    id: string;
    userId: string;
    coment: string;
    createdAt: Date;
  }[];
};

export type ReplysData = {
  name: string;
  coment: string;
  createdAt: Date;
};

// Post traído de la DB, puede venir con Timestamp
export type RawPostData = Omit<PostData, "createdAt"> & {
  createdAt: Timestamp | Date;
};

// Post procesado para UI
export type PostData = {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  description: string;
  imgs: string[];
  likes: number;
  coments: ComentData[];
  profilePhoto?: string;
};

// Información del usuario
export type UserData = {
  id: string;
  profilePhoto: string;
  name: string;
  category: string;
  likedPostIds: string[];
  savedPostIds: string[];
};

export type UserMap = {
  [userId: string]: UserData;
};

export type PostUser = {
  id?: string;
  profilePhoto?: string;
  name?: string;
  category?: string;
};
