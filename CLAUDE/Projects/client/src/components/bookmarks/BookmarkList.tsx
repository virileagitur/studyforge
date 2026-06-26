import React from 'react';
import BookmarkItem from './BookmarkItem';
import { Bookmark } from '../../client/src/types/bookmark';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onRefresh?: () => Promise<void>;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (id: string) => Promise<void>;
  onToggleFavorite?: (id: string) => Promise<void>;
}

const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onRefresh,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No bookmarks found. Click "Add Bookmark" to create your first bookmark.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map(bookmark => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={onEdit ? () => onEdit(bookmark) : undefined}
          onDelete={onDelete ? () => onDelete(bookmark.id) : undefined}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(bookmark.id) : undefined}
        />
      ))}
    </div>
  );
};

export default BookmarkList;