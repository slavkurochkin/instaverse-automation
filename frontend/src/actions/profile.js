import * as api from '../api';
import { FETCH_PROFILE, FETCH_USER_STORIES } from '../constants/actionTypes';

export const getProfile = () => async (dispatch) => {
  try {
    const { data } = await api.getProfile();
    dispatch({ type: FETCH_PROFILE, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const getUserProfile = (id) => async (dispatch) => {
  try {
    const { data } = await api.getUserProfile(id); // Fetch user profile data
    dispatch({ type: 'FETCH_USER_PROFILE_SUCCESS', payload: data });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserProfiles = () => async (dispatch) => {
  try {
    const { data } = await api.getUserProfiles(); // Fetch user profile data
    dispatch({ type: 'FETCH_USER_PROFILES_SUCCESS', payload: data });
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getUserStories = (userId) => async (dispatch) => {
  try {
    const { data } = await api.fetchUserStories(userId);
    dispatch({ type: FETCH_USER_STORIES, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};
