/* const profileReducer = (state = [], action) => {
    switch (action.type) {
        case "FETCH_PROFILE":
            return action.payload;
        default:
            return state;
    }
};

export default profileReducer; */

const profileReducer = (state = { profile: {} }, action) => {
    switch (action.type) {
      case 'FETCH_USER_PROFILE_SUCCESS':
        return { ...state, profile: action.payload };
      case 'FETCH_USER_PROFILES_SUCCESS':
        return { ...state, profiles: action.payload };  
      default:
        return state;
    }
  };
  
  export default profileReducer;
  