import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  addComment, 
  addReply, 
  getComments, 
  toggleLike 
} from '../../../firestoreService';

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (chapterId, { rejectWithValue }) => {
    try {
      const comments = await getComments(chapterId);
      const transformedComments = comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : null,
        replies: comment.replies.map(reply => ({
          ...reply,
          createdAt: reply.createdAt?.toDate ? reply.createdAt.toDate() : null
        }))
      }));
      return transformedComments;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createComment = createAsyncThunk(
    'comments/createComment',
    async ({ novelId, volumeId, chapterId, content }, { rejectWithValue }) => {
      try {
        if (!novelId || !volumeId || !chapterId || !content) {
          throw new Error('Novel ID, Volume ID, Chapter ID and content are required');
        }
  
        const newComment = await addComment(novelId, volumeId, chapterId, { content });
        return newComment;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

export const createReply = createAsyncThunk(
  'comments/createReply',
  async ({ chapterId, parentCommentId, replyData }, { rejectWithValue }) => {
    try {
      const newReply = await addReply(chapterId, parentCommentId, replyData);
      return { parentCommentId, reply: newReply };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  'comments/toggleLike',
  async ({ chapterId, commentId, replyId }, { rejectWithValue }) => {
    try {
      const isLiked = await toggleLike(chapterId, commentId, replyId);
      return { commentId, replyId, isLiked };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const commentsSlice = createSlice({
    name: 'comments',
    initialState: {
      comments: [],
      isLoading: false,
      error: null
    },
    reducers: {
      clearComments: (state) => {
        state.comments = [];
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchComments.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchComments.fulfilled, (state, action) => {
          state.isLoading = false;
          state.comments = action.payload;
        })
        .addCase(fetchComments.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })
        .addCase(createComment.fulfilled, (state, action) => {
          state.comments.unshift(action.payload);
        })
        .addCase(createReply.fulfilled, (state, action) => {
          const { parentCommentId, reply } = action.payload;
          const comment = state.comments.find(c => c.id === parentCommentId);
          if (comment) {
            comment.replies.push(reply);
          }
        })
        .addCase(toggleCommentLike.fulfilled, (state, action) => {
          const { commentId, replyId, isLiked } = action.payload;
          const userId = auth.currentUser.uid;
          
          if (replyId) {
            const comment = state.comments.find(c => c.id === commentId);
            const reply = comment?.replies.find(r => r.id === replyId);
            if (reply) {
              reply.likes += isLiked ? 1 : -1;
              if (isLiked) {
                reply.likedBy.push(userId);
              } else {
                reply.likedBy = reply.likedBy.filter(id => id !== userId);
              }
            }
          } else {
            const comment = state.comments.find(c => c.id === commentId);
            if (comment) {
              comment.likes += isLiked ? 1 : -1;
              if (isLiked) {
                comment.likedBy.push(userId);
              } else {
                comment.likedBy = comment.likedBy.filter(id => id !== userId);
              }
            }
          }
        });
    }
  });
  
  export const { clearComments } = commentsSlice.actions;
  export default commentsSlice.reducer;