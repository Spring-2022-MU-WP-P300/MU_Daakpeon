const initialstate = {
  isAuthenticated: false,
  user: {}
}

export default function authReducer(state=initialstate, action) {
  switch(action.type) {
    default:
      return state;
  }
}; 