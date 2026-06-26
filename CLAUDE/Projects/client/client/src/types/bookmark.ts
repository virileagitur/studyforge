export interface Bookmark {
  id: string;
  userId: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkFormData {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}