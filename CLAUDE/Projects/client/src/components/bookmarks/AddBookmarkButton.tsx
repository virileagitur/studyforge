import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddBookmarkButton: React.FC = () => {
  const navigate = useNavigate();

  const handleAddBookmark = () => {
    navigate('/bookmarks/new');
  };

  return (
    <button
      onClick={handleAddBookmark}
      className="px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-bold rounded"
    >
      Add Bookmark
    </button>
  );
};

export default AddBookmarkButton;