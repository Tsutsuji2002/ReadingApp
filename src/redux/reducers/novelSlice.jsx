import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNewNovels, getVolumesAndChapters, getChapterContent, getNovelById, fetchBookmarkById, saveBookmark, saveReadingProgress, getReadingProgress, getUserReadingProgress,
   fetchChapterData, getUserNovels, createNovel, deleteNovel} from '../../../firestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NovelFirestoreService } from '../../../firestoreService';

const formatNovelData = (novels) => {
  return novels.map((novel) => ({
    ...novel,
    created_at: novel.created_at?.toDate?.() ? novel.created_at.toDate().toISOString() : null,
    updated_at: novel.updated_at?.toDate?.() ? novel.updated_at.toDate().toISOString() : null,
  }));
};

const convertTimestamps = (data) => {
  if (data === null || data === undefined) return data;

  if (typeof data === 'object' && !Array.isArray(data)) {
    const convertedObject = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value && value.seconds !== undefined && value.nanoseconds !== undefined) {
        convertedObject[key] = new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
      } else {
        convertedObject[key] = convertTimestamps(value);
      }
    });
    return convertedObject;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }

  return data;
};

export const fetchNovels = createAsyncThunk(
  'novels/fetchNovels',
  async (_, { rejectWithValue }) => {
    try {
      const novels = await getNewNovels();
      return formatNovelData(novels);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNovelById = createAsyncThunk(
  'novels/fetchNovelById',
  async (novelId, { rejectWithValue }) => {
    try {
      const novel = await getNovelById(novelId);
      return novel;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch novel');
    }
  }
);


export const fetchVolumesAndChapters = createAsyncThunk(
  'novels/fetchVolumesAndChapters',
  async (novelId, { rejectWithValue }) => {
    try {
      const volumes = await getVolumesAndChapters(novelId);
      return volumes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChapterContent = createAsyncThunk(
  'novels/fetchChapterContent',
  async ({ novelId, volumeId, chapterId }, { rejectWithValue }) => {
    try {
      if (!novelId || !volumeId || !chapterId) {
        throw new Error('Missing required parameters');
      }
      
      const chapter = await getChapterContent(novelId, volumeId, chapterId);
      return chapter;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chapter');
    }
  }
);

export const addBookmark = createAsyncThunk(
  'novels/addBookmark',
  async ({ novelId, volumeId, chapterId, position }, { rejectWithValue }) => {
    try {
      if (!novelId || !volumeId || !chapterId) {
        throw new Error('Missing required parameters');
      }
      
      await saveBookmark({
        novelId,
        volumeId,
        chapterId,
        position,
        timestamp: new Date().toISOString()
      });
      
      return { novelId, volumeId, chapterId, position };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save bookmark');
    }
  }
);

export const fetchBookmark = createAsyncThunk(
  'novels/fetchBookmark',
  async (bookmarkId, { rejectWithValue }) => {
    try {
      if (!bookmarkId) {
        throw new Error('Bookmark ID is required');
      }
      
      const bookmark = await fetchBookmarkById(bookmarkId);
      return bookmark;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch bookmark');
    }
  }
);

export const saveReadingPosition = createAsyncThunk(
  'novels/saveReadingPosition',
  async ({ novelId, volumeId, chapterId, position }, { rejectWithValue }) => {
    try {
      const key = `reading_position_${novelId}_${volumeId}_${chapterId}`;
      const localData = {
        position,
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(localData));
      
      const result = await saveReadingProgress({ novelId, volumeId, chapterId, position })
        .catch(() => null);
      
      return {
        novelId,
        volumeId,
        chapterId,
        position,
        timestamp: localData.timestamp
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save reading position');
    }
  }
);

export const getReadingPosition = createAsyncThunk(
  'novels/getReadingPosition',
  async ({ novelId, volumeId, chapterId }, { rejectWithValue }) => {
    try {
      const dbProgress = await getReadingProgress(novelId, volumeId, chapterId)
        .catch(() => null);
      
      if (dbProgress) {
        const key = `reading_position_${novelId}_${volumeId}_${chapterId}`;
        await AsyncStorage.setItem(key, JSON.stringify({
          position: dbProgress.position,
          timestamp: dbProgress.updated_at
        }));
        
        return dbProgress;
      }

      const key = `reading_position_${novelId}_${volumeId}_${chapterId}`;
      const savedPosition = await AsyncStorage.getItem(key);
      return savedPosition ? JSON.parse(savedPosition) : null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get reading position');
    }
  }
);

export const fetchReadingProgress = createAsyncThunk(
  'novels/fetchReadingProgress',
  async (_, { rejectWithValue }) => {
    try {
      const progress = await getUserReadingProgress();

      const serializedProgress = progress.map(item => convertTimestamps(item));

      return serializedProgress;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFavoriteNovels = createAsyncThunk(
  'novels/fetchFavoriteNovels',
  async (userId, { rejectWithValue }) => {
    try {
      const favoriteNovels = await NovelFirestoreService.getFavoriteNovels(userId);

      console.log('Fetched favorite novels:', favoriteNovels);

      return favoriteNovels;
    } catch (error) {
      console.error('Error fetching favorite novels:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'novels/toggleFavorite',
  async (novelId, { rejectWithValue }) => {
    try {
      if (!novelId) {
        throw new Error('Novel ID is required');
      }
      const result = await NovelFirestoreService.toggleFavoriteNovel(novelId);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Error toggling favorite');
    }
  }
);

export const checkNovelFavoriteStatus = createAsyncThunk(
  'novels/checkFavoriteStatus',
  async (novelId, { rejectWithValue }) => {
    try {
      if (!novelId) {
        throw new Error('Novel ID is required');
      }
      const isFavorited = await NovelFirestoreService.isNovelFavorited(novelId);
      return {
        novelId,
        isFavorite: isFavorited
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNovelDetails = createAsyncThunk(
  'novels/fetchNovelDetails',
  async (novelId, { rejectWithValue }) => {
    try {
      return await NovelFirestoreService.getNovelDetails(novelId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNovelChapters = createAsyncThunk(
  'novels/fetchNovelChapters',
  async (novelId, { rejectWithValue }) => {
    try {
      return await NovelFirestoreService.getNovelChapters(novelId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChapterDataById = createAsyncThunk(
  'novels/fetchChapterDataById',
  async ({ chapterId }, { rejectWithValue }) => {
    try {
      const chapterData = await fetchChapterData(chapterId);
      return { chapterId, chapterData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const postNovel = createAsyncThunk(
  'novels/postNovel',
  async (novelData, { rejectWithValue }) => {
    try {
      const newNovel = await NovelFirestoreService.addNovel(novelData);
      return newNovel;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserNovels = createAsyncThunk(
  'novels/fetchUserNovels',
  async () => {
    try {
      const novels = await getUserNovels();
      return novels;
    } catch (error) {
      throw error;
    }
  }
);

export const createUserNovel = createAsyncThunk(
  'novels/createUserNovel',
  async (novelData) => {
    try {
      const newNovel = await createNovel(novelData);
      return newNovel;
    } catch (error) {
      throw error;
    }
  }
);

export const updateUserNovel = createAsyncThunk(
  'novels/updateUserNovel',
  async ({ novelId, updateData }) => {
    try {
      const updatedNovel = await updateNovel(novelId, updateData);
      return updatedNovel;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteUserNovel = createAsyncThunk(
  'novels/deleteUserNovel',
  async (novelId) => {
    try {
      await deleteNovel(novelId);
      return novelId;
    } catch (error) {
      throw error;
    }
  }
);
export const fetchVolumes = createAsyncThunk(
  'novels/fetchVolumes',
  async (novelId) => {
    const volumes = await NovelFirestoreService.getVolumes(novelId);
    return volumes;
  }
);

export const createVolume = createAsyncThunk(
  'novels/createVolume',
  async ({ novelId, volumeData }) => {
    const newVolume = await NovelFirestoreService.addVolume(novelId, volumeData);
    return { id: newVolume.id, ...volumeData }; // Return the new volume with its id
  }
);

export const createChapter = createAsyncThunk(
  'novels/createChapter',
  async ({ novelId, volumeId, chapterData }) => {
    const newChapter = await NovelFirestoreService.addChapter(novelId, volumeId, chapterData);
    return { id: newChapter.id, ...chapterData }; // Return the new chapter with its id
  }
);

export const updateNovel = createAsyncThunk(
  'novels/updateNovel',
  async ({ novelId, updateData }) => {
    await NovelFirestoreService.updateNovel(novelId, updateData);
    return updateData; // Return updated data if needed
  }
);

const novelSlice = createSlice({
  name: 'novels',
  initialState: {
    novels: [],
    volumes: [],
    currentNovel: null,
    currentChapter: null,
    isLoading: false,
    error: null,
    bookmarks: [],
    currentBookmark: null,
    lastReadPosition: null,
    readingProgress: [],
    favoriteStatuses: [],
    favorites: {
      byId: {}, 
      allIds: [],
      isLoading: false,
      error: null
    },
    userNovels: {
      items: [],
      isLoading: false,
      error: null
    }
  },
  reducers: {
    clearCurrentChapter: (state) => {
      state.currentChapter = null;
    },
    setLastReadPosition: (state, action) => {
      state.lastReadPosition = action.payload;
    },
    clearReadingProgress: (state) => {
      state.readingProgress = [];
    },
    setFavoriteNovels: (state, action) => {
      state.favoriteNovels = action.payload;
    },
    toggleFavoriteStart: (state) => {
      state.isLoading = true;
    },
    toggleFavoriteSuccess: (state, action) => {
      state.isLoading = false;
      if (action.payload.isFavorite) {
        state.favoriteNovels.push(action.payload.novelId);
      } else {
        state.favoriteNovels = state.favoriteNovels.filter(id => id !== action.payload.novelId);
      }
    },
    toggleFavoriteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearFavorites: (state) => {
      state.favorites.byId = {};
      state.favorites.allIds = [];
    },
    setCurrentNovel: (state, action) => {
      state.currentNovel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNovels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNovels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.novels = action.payload;
      })
      .addCase(fetchNovels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchVolumesAndChapters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVolumesAndChapters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.volumes = action.payload;
      })
      .addCase(fetchVolumesAndChapters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchChapterContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChapterContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChapter = action.payload;
      })
      .addCase(fetchChapterContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookmarks.push(action.payload);
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchNovelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNovelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNovel = action.payload;
      })
      .addCase(fetchNovelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBookmark = action.payload;
      })
      .addCase(fetchBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(saveReadingPosition.fulfilled, (state, action) => {
        state.lastReadPosition = action.payload;
      })
      .addCase(saveReadingPosition.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getReadingPosition.fulfilled, (state, action) => {
        state.lastReadPosition = action.payload;
      })
      .addCase(getReadingPosition.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchReadingProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReadingProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.readingProgress = action.payload;
      })
      .addCase(fetchReadingProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchChapterDataById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChapterDataById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chapterData[action.payload.chapterId] = action.payload.chapterData;
      })
      .addCase(fetchChapterDataById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFavoriteNovels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFavoriteNovels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteNovels = action.payload;
      })
      .addCase(fetchFavoriteNovels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(checkNovelFavoriteStatus.pending, (state) => {
        state.favorites.isLoading = true;
        state.favorites.error = null;
      })
      .addCase(checkNovelFavoriteStatus.fulfilled, (state, action) => {
        state.favorites.isLoading = false;
        state.favorites.byId[action.payload.novelId] = {
          isFavorite: action.payload.isFavorite,
          timestamp: new Date().toISOString()
        };
        })
      .addCase(checkNovelFavoriteStatus.rejected, (state, action) => {
        state.favorites.isLoading = false;
        state.favorites.error = action.payload;
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.favorites.isLoading = true;
        state.favorites.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites.isLoading = false;
        state.favorites.byId[action.payload.novelId] = {
          isFavorite: action.payload.isFavorite,
          timestamp: action.payload.timestamp
        };
        
        if (action.payload.isFavorite) {
          if (!state.favorites.allIds.includes(action.payload.novelId)) {
            state.favorites.allIds = [...state.favorites.allIds, action.payload.novelId];
          }
        } else {
          state.favorites.allIds = state.favorites.allIds.filter(id => id !== action.payload.novelId);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.favorites.isLoading = false;
        state.favorites.error = action.payload;
      })
      .addCase(postNovel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(postNovel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.novels.push(action.payload);
      })
      .addCase(postNovel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserNovels.pending, (state) => {
        state.userNovels.isLoading = true;
        state.userNovels.error = null;
      })
      .addCase(fetchUserNovels.fulfilled, (state, action) => {
        state.userNovels.items = action.payload;
        state.userNovels.isLoading = false;
      })
      .addCase(fetchUserNovels.rejected, (state, action) => {
        state.userNovels.isLoading = false;
        state.userNovels.error = action.error.message;
      })

    // Create novel
      .addCase(createUserNovel.fulfilled, (state, action) => {
        state.userNovels.items.unshift(action.payload);
      })

    // Update novel
      .addCase(updateUserNovel.fulfilled, (state, action) => {
        const index = state.userNovels.items.findIndex(
          novel => novel.novelId === action.payload.novelId
        );
        if (index !== -1) {
          state.userNovels.items[index] = {
            ...state.userNovels.items[index],
            ...action.payload
          };
        }
      })

    // Delete novel
      .addCase(deleteUserNovel.fulfilled, (state, action) => {
        state.userNovels.items = state.userNovels.items.filter(
          novel => novel.novelId !== action.payload
        );
      })
      .addCase(fetchVolumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVolumes.fulfilled, (state, action) => {
        state.loading = false;
        state.volumes = action.payload;
      })
      .addCase(fetchVolumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createVolume.fulfilled, (state, action) => {
        state.volumes.push(action.payload);
      })
      .addCase(createChapter.fulfilled, (state, action) => {
      });
  },
});



export const { clearCurrentChapter, setFavoriteNovels, toggleFavoriteStart, toggleFavoriteSuccess, toggleFavoriteFailure, clearFavorites, setCurrentNovel } = novelSlice.actions;
export default novelSlice.reducer;