import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '@/hooks/useBookmarks';
import BookmarkList from '@/components/bookmarks/BookmarkList';
import AddBookmarkButton from '@/components/bookmarks/AddBookmarkButton';

const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    bookmarks,
    loading,
    error,
    refetch
  } = useBookmarks();

  const handleAddBookmark = () => {
    navigate('/bookmarks/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
          <span className="ml-3 text-text-primary">Loading bookmarks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-background py-6">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-text-primary mb-4">Bookmarks</h2>
            <button
              onClick={handleAddBookmark}
              className="mb-4 px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded"
            >
              Add Bookmark
            </button>
            <BookmarkList bookmarks={[]} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background py-6">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Bookmarks</h2>
          <button
            onClick={handleAddBookmark}
            className="px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-semibold rounded"
          >
            Add Bookmark
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-600">
            {error}
          </div>
        )}

        <div className="bg-card-background p-6 rounded-xl shadow-sm">
          <BookmarkList
            bookmarks={bookmarks}
            onRefresh={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;