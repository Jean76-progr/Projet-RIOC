export interface Widget {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
  thumbnail?: string;
  defaultSize: { width: number; height: number };
  createdAt: Date;
}