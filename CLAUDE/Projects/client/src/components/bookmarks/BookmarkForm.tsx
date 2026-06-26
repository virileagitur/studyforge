import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkFormData } from '@/types/bookmark';

interface BookmarkFormProps {
  // If editing, the bookmark ID would be in the URL params
  // If creating, no bookmark ID is needed
}

const BookmarkForm: React.FC<BookmarkFormProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isEditing } = useParams<{ isEditing: string }>(); // Alternative approach

  const {
    createBookmark,
    updateBookmark,
    loading,
    error
  } = useBookmarks();

  const [formData, setFormData] = useState<BookmarkFormData>({
    title: '',
    url: '',
    description: '',
    tags: []
  });

  // If editing, fetch the bookmark data to populate the form
  // useEffect(() => {
  //   if (id) {
  //     // Fetch bookmark by ID and populate form
  //   }
  // }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) {
        // Update existing bookmark
        await updateBookmark(id, formData);
      } else {
        // Create new bookmark
        await createBookmark(formData);
      }

      // Navigate back to bookmarks list
      navigate(-1);
    } catch (err: any) {
      // Error handling will be done by the hook
      console.error('Failed to save bookmark:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      url: e.target.value
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-card-background p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {id ? 'Edit Bookmark' : 'Add Bookmark'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="Enter bookmark title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleUrlChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="Enter website URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="Enter description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="e.g., javascript, tutorial, reference"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-text-secondary hover:bg-text-secondary/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-primary-orange hover:bg-primary-orange-light text-white font-bold rounded-md disabled:opacity-50`}
            >
              {loading ? 'Saving...' : (id ? 'Update Bookmark' : 'Add Bookmark')}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkForm;