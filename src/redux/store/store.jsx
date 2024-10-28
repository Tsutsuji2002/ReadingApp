import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authSlice';
import novelReducer from '../reducers/novelSlice';
import commentReducer from '../reducers/commentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    novels: novelReducer,
    comments: commentReducer,
  }
});

export default store;
