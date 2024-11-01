import * as api from '../api';
import {
  FETCH_ALL_STORIES,
  FETCH_ALL_TAGS,
  FETCH_STORIES_BY_TAG,
  CREATE_STORY,
  UPDATE_STORY,
  DELETE_STORY,
  DELETE_USER_STORIES,
  DELETE_USER_COMMENTS,
} from '../constants/actionTypes';

export const getStories = () => async (dispatch) => {
  try {
    const { data } = await api.fetchStories();
    dispatch({ type: FETCH_ALL_STORIES, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchStoriesByTag = (tag) => async (dispatch) => {
  try {
    const { data } = await api.fetchStoriesByTag(tag);
    dispatch({ type: FETCH_STORIES_BY_TAG, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchAllTags = () => async (dispatch) => {
  try {
    const { data } = await api.fetchAllTags();
    dispatch({ type: FETCH_ALL_TAGS, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const createStory = (story) => async (dispatch) => {
  try {
    const { data } = await api.createStory(story);
    dispatch({ type: CREATE_STORY, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateStory = (id, story) => async (dispatch) => {
  try {
    const { data } = await api.updateStory(id, story);

    dispatch({ type: UPDATE_STORY, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteStory = (id) => async (dispatch) => {
  try {
    await api.deleteStory(id);

    dispatch({ type: DELETE_STORY, payload: id });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteUserStories = (userId) => async (dispatch) => {
  try {
    await api.deleteUserStories(userId);
    dispatch({ type: DELETE_USER_STORIES, payload: userId });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteUserComments = (userId) => async (dispatch) => {
  try {
    await api.deleteUserComments(userId);
    dispatch({ type: DELETE_USER_COMMENTS, payload: userId });
  } catch (error) {
    console.log(error.message);
  }
};

export const likeStory = (id) => async (dispatch) => {
  try {
    const { data } = await api.likeStory(id);

    dispatch({ type: UPDATE_STORY, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const commentOnStory = (id, comment) => async (dispatch) => {
  try {
    const { data } = await api.commentOnStory(id, comment);
    await dispatch({ type: UPDATE_STORY, payload: data }); // Ensure this is awaited
    return data; // Return the updated story from the backend
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const updateStoryOrder = (newOrder) => ({
  type: 'UPDATE_STORY_ORDER',
  payload: newOrder,
});

// Action to delete a comment
export const deleteComment = (storyId, commentId) => async (dispatch) => {
  try {
    const { data } = await api.deleteComment(storyId, commentId);
    dispatch({ type: UPDATE_STORY, payload: data });
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};
