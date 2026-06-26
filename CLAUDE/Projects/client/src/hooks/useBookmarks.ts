import { useState, useEffect, useCallback } from 'react';
import { bookmarkAPI } from '../services/api';
import { Bookmark } from '../../client/src/types/bookmark';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    tags: '' as string | string[],
  });

  // Fetch bookmarks based on current filters
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookmarkAPI.getBookmarks(filters);
      setBookmarks(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bookmarks:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch bookmarks when filters change
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      tags: '',
    });
  }, []);

  // Create a new bookmark
  const createBookmark = useCallback(async (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const response = await bookmarkAPI.createBookmark(bookmarkData);
      // Optimistically update the bookmarks list
      setBookmarks(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create bookmark');
    }
  }, []);

  // Update an existing bookmark
  const updateBookmark = useCallback(async (id: string, bookmarkData: Partial<Bookmark>) => {
    try {
      const response = await bookmarkAPI.updateBookmark(id, bookmarkData);
      // Update the bookmark in the list
      setBookmarks(prev =>
        prev.map(bookmark => bookmark.id === id ? response.data : bookmark)
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update bookmark');
    }
  }, []);

  // Delete a bookmark
  const deleteBookmark = useCallback(async (id: string) => {
    try {
      await bookmarkAPI.deleteBookmark(id);
      // Remove the bookmark from the list
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete bookmark');
    }
  }, []);

  // Get a single bookmark by ID
  const getBookmarkById = useCallback(async (id: string) => {
    try {
      const response = await bookmarkAPI.getBookmarkById(id);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch bookmark');
    }
  }, []);

  return {
    bookmarks,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmarkById
  };
};