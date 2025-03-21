const storyReducer = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_ALL_STORIES':
      return action.payload;
    case 'FETCH_USER_STORIES':
      return action.payload;
    case 'FETCH_STORIES_BY_TAG':
      return action.payload;
    case 'CREATE_STORY':
      return [...state, action.payload];
    case 'UPDATE_STORY':
      return state.map((story) =>
        story._id === action.payload._id ? action.payload : story,
      );
    case 'DELETE_STORY':
      return state.filter((story) => story._id !== action.payload);
    case 'DELETE_USER_STORIES':
      return action.payload;
    case 'DELETE_USER_COMMENTS':
      return action.payload;
    case 'UPDATE_STORY_ORDER':
      return [...state, action.payload];
    default:
      return state;
  }
};

export default storyReducer;
