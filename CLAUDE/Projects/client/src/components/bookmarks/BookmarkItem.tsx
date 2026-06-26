import React from 'react';
import { Bookmark } from '../../client/src/types/bookmark';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete?: (id: string) => Promise<void>;
  onToggleFavorite?: (id: string) => Promise<void>;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({
  bookmark,
  onDelete,
  onToggleFavorite
}) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      if (onDelete) {
        await onDelete(bookmark.id);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (onToggleFavorite) {
      await onToggleFavorite(bookmark.id);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-start">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-text-primary">{bookmark.title}</h3>
          {bookmark.isFavorite && (
            <span className="text-primary-orange">★</span>
          )}
        </div>

        {bookmark.description && (
          <p className="text-sm text-text-secondary mb-2 line-clamp-2">
            {bookmark.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-2">
          {bookmark.tags && bookmark.tags.length > 0 && (
            bookmark.tags.map((tag: string, index: number) => (
              <span key={index} className="px-2 py-0.5 text-xs bg-primary-orange/20 text-primary-orange rounded">
                #{tag}
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span>
            Added: {new Date(bookmark.createdAt).toLocaleDateString()}
          </span>

          {bookmark.url && (
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-orange"
            >
              Visit Link
            </a>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-full hover:bg-primary-orange/20 transition-colors ${
            bookmark.isFavorite ? 'text-primary-orange' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {bookmark.isFavorite ? '★' : '☆'}
        </button>

        <button
          onClick={handleDelete}
          className="p-2 rounded-full hover:bg-red-50 text-red-600 hover:text-red-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BookmarkItem;