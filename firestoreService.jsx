import { doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc, collection, query, orderBy, limit, getDocs, where, increment, serverTimestamp, runTransaction } from '@firebase/firestore';
import { db, auth } from './firebaseConfig';
import { Timestamp } from '@firebase/firestore';

const convertTimestampToISOString = (timestamp) => {
  if (!timestamp) return null;
  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  // Handle server timestamp placeholder
  if (timestamp._methodName === 'serverTimestamp') {
    return new Date().toISOString();
  }
  // Handle Date objects
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return null;
};

export const getUserNovels = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const novelsRef = collection(db, 'novels');
    const q = query(
      novelsRef,
      where('created_by', '==', user.uid),
      // orderBy('updated_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const novels = querySnapshot.docs.map(doc => ({
      novelId: doc.id,
      ...doc.data(),
      created_at: convertTimestampToISOString(doc.data().created_at),
      updated_at: convertTimestampToISOString(doc.data().updated_at)
    }));
    console.log("User novel: ",user.uid);
    return novels;
  } catch (error) {
    console.error('Error fetching user novels:', error);
    throw error;
  }
};

export const createNovel = async (novelData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const novelRef = collection(db, 'novels');
    const newNovel = {
      ...novelData,
      created_by: user.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      view_count: 0,
      rating: 0,
      total_chapters: 0
    };

    const docRef = await addDoc(novelRef, newNovel);
    return { ...newNovel, novelId: docRef.id };
  } catch (error) {
    console.error('Error creating novel:', error);
    throw error;
  }
};

export const updateNovel = async (novelId, updateData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const novelRef = doc(db, 'novels', novelId);
    const novelDoc = await getDoc(novelRef);
    
    if (!novelDoc.exists()) throw new Error('Novel not found');
    if (novelDoc.data().create_by !== user.uid) throw new Error('Unauthorized');

    const updatedData = {
      ...updateData,
      updated_at: serverTimestamp()
    };

    await updateDoc(novelRef, updatedData);
    return { novelId, ...updatedData };
  } catch (error) {
    console.error('Error updating novel:', error);
    throw error;
  }
};

export const deleteNovel = async (novelId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const novelRef = doc(db, 'novels', novelId);
    const novelDoc = await getDoc(novelRef);
    
    if (!novelDoc.exists()) throw new Error('Novel not found');
    if (novelDoc.data().create_by !== user.uid) throw new Error('Unauthorized');

    // Delete all volumes and chapters
    const volumesRef = collection(db, 'novels', novelId, 'volumes');
    const volumesSnapshot = await getDocs(volumesRef);
    
    for (const volumeDoc of volumesSnapshot.docs) {
      const chaptersRef = collection(volumeDoc.ref, 'chapters');
      const chaptersSnapshot = await getDocs(chaptersRef);
      
      for (const chapterDoc of chaptersSnapshot.docs) {
        await deleteDoc(chapterDoc.ref);
      }
      await deleteDoc(volumeDoc.ref);
    }

    await deleteDoc(novelRef);
    return novelId;
  } catch (error) {
    console.error('Error deleting novel:', error);
    throw error;
  }
};

export const getNovelStats = async (novelId) => {
  try {
    const novelRef = doc(db, 'novels', novelId);
    const novelDoc = await getDoc(novelRef);
    
    if (!novelDoc.exists()) throw new Error('Novel not found');

    const volumesRef = collection(db, 'novels', novelId, 'volumes');
    const volumesSnapshot = await getDocs(volumesRef);
    
    let totalWords = 0;
    let totalChapters = 0;

    for (const volumeDoc of volumesSnapshot.docs) {
      const chaptersRef = collection(volumeDoc.ref, 'chapters');
      const chaptersSnapshot = await getDocs(chaptersRef);
      
      totalChapters += chaptersSnapshot.size;
      
      for (const chapterDoc of chaptersSnapshot.docs) {
        totalWords += chapterDoc.data().word_count || 0;
      }
    }

    return {
      totalWords,
      totalChapters,
      viewCount: novelDoc.data().view_count || 0,
      rating: novelDoc.data().rating || 0
    };
  } catch (error) {
    console.error('Error getting novel stats:', error);
    throw error;
  }
};

///--start-novels-area--///
export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef); 
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    throw new Error('User not found');
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const getNewNovels = async () => {
  try {
    const novelsCollectionRef = collection(db, 'novels');
    const novelsQuery = query(novelsCollectionRef, orderBy('created_at', 'desc'), limit(30));
    const novelsSnapshot = await getDocs(novelsQuery);
    
    const novelsList = novelsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return novelsList;
  } catch (error) {
    console.error('Error fetching novels:', error);
    throw error;
  }
};

export const getNovelById = async (novelId) => {
  try {
    if (!novelId) {
      throw new Error('Novel ID is required');
    }

    const novelDocRef = doc(db, 'novels', novelId);
    const novelDoc = await getDoc(novelDocRef);
    
    if (!novelDoc.exists()) {
      throw new Error('Novel not found');
    }

    const novelData = novelDoc.data();
    const formatTimestamp = (timestamp) => {
      return timestamp?.toDate?.() ? timestamp.toDate().toISOString() : null;
    };

    return {
      id: novelDoc.id,
      ...novelData,
      created_at: formatTimestamp(novelData.created_at),
      updated_at: formatTimestamp(novelData.updated_at),
    };
  } catch (error) {
    console.error('Error fetching novel:', error);
    throw new Error(`Failed to fetch novel: ${error.message}`);
  }
};

export const getVolumesAndChapters = async (novelId) => {
  try {
    const volumesCollectionRef = collection(db, 'novels', novelId, 'volumes');
    const volumesSnapshot = await getDocs(volumesCollectionRef);

    const volumesList = await Promise.all(volumesSnapshot.docs.map(async (volumeDoc) => {
      const volumeData = volumeDoc.data();
      const chaptersCollectionRef = collection(db, 'novels', novelId, 'volumes', volumeDoc.id, 'chapters');
      const chaptersSnapshot = await getDocs(chaptersCollectionRef);

      const chaptersList = chaptersSnapshot.docs.map((chapterDoc) => {
        const chapterData = chapterDoc.data();
        return {
          id: chapterDoc.id,
          ...chapterData,
          created_at: chapterData.created_at?.toDate?.() ? chapterData.created_at.toDate().toISOString() : null,
          last_modified: chapterData.last_modified?.toDate?.() ? chapterData.last_modified.toDate().toISOString() : null,
        };
      });

      return {
        id: volumeDoc.id,
        ...volumeData,
        chapters: chaptersList,
      };
    }));

    return volumesList;
  } catch (error) {
    console.error('Error fetching volumes and chapters:', error);
    throw error;
  }
};

export const getChapterContent = async (novelId, volumeId, chapterId) => {
  try {
    if (!novelId || !volumeId || !chapterId) {
      throw new Error('Missing required parameters');
    }

    const chapterDocRef = doc(
      db, 
      'novels', 
      novelId, 
      'volumes', 
      volumeId, 
      'chapters', 
      chapterId
    );
    
    const chapterDoc = await getDoc(chapterDocRef);
    
    if (!chapterDoc.exists()) {
      throw new Error('Chapter not found');
    }

    const chapterData = chapterDoc.data();
    
    const formatTimestamp = (timestamp) => {
      return timestamp?.toDate?.() ? timestamp.toDate().toISOString() : null;
    };

    return {
      id: chapterDoc.id,
      ...chapterData,
      created_at: formatTimestamp(chapterData.created_at),
      last_modified: formatTimestamp(chapterData.last_modified)
    };
  } catch (error) {
    console.error('Error fetching chapter:', error);
    throw new Error(`Failed to fetch chapter: ${error.message}`);
  }
};

export const saveBookmark = async (bookmarkData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to save bookmarks');
    }

    const bookmarkRef = collection(db, 'users', userId, 'bookmarks');
    
    const bookmark = {
      novelId: bookmarkData.novelId,
      volumeId: bookmarkData.volumeId,
      chapterId: bookmarkData.chapterId,
      position: bookmarkData.position,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const docRef = await addDoc(bookmarkRef, bookmark);
    return { id: docRef.id, ...bookmark };
    
  } catch (error) {
    console.error('Error saving bookmark:', error);
    throw error;
  }
};

export const fetchBookmarkById = async (bookmarkId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to fetch bookmarks');
    }

    if (!bookmarkId) {
      throw new Error('Bookmark ID is required');
    }

    const bookmarkDocRef = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    const bookmarkDoc = await getDoc(bookmarkDocRef);

    if (!bookmarkDoc.exists()) {
      throw new Error('Bookmark not found');
    }

    return {
      id: bookmarkDoc.id,
      ...bookmarkDoc.data(),
    };
  } catch (error) {
    console.error('Error fetching bookmark by ID:', error);
    throw error;
  }
};

export const saveReadingPosition = async (userId, novelId, volumeId, chapterId, position) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const progressId = `${novelId}_${volumeId}_${chapterId}`;
    const progressRef = doc(db, 'users', userId, 'reading_progress', progressId);
    
    await setDoc(progressRef, {
      novelId,
      volumeId,
      chapterId,
      position,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    return { progressId, position };
  } catch (error) {
    console.error('Error saving reading position:', error);
    throw error;
  }
};

export const getReadingPosition = async (userId, novelId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const progressRef = collection(db, 'users', userId, 'reading_progress');
    const progressQuery = query(
      progressRef,
      where('novelId', '==', novelId),
      orderBy('updated_at', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(progressQuery);
    if (snapshot.empty) return null;
    
    const data = snapshot.docs[0].data();
    return {
      ...data,
      created_at: data.created_at?.toDate?.() ? 
        data.created_at.toDate().toISOString() : null,
      updated_at: data.updated_at?.toDate?.() ? 
        data.updated_at.toDate().toISOString() : null
    };
  } catch (error) {
    console.error('Error fetching reading position:', error);
    throw error;
  }
};

export const saveReadingProgress = async (progressData) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return null;
  }

  try {
    const { novelId, volumeId, chapterId, position } = progressData;
    const progressId = `${novelId}_${volumeId}_${chapterId}`;
    
    const progressRef = doc(
      collection(db, 'users', userId, 'reading_progress'),
      progressId
    );

    const progressDoc = await getDoc(progressRef);
    const timestamp = serverTimestamp();

    if (progressDoc.exists()) {
      await updateDoc(progressRef, {
        position,
        updated_at: timestamp
      });
    } else {
      await setDoc(progressRef, {
        novelId,
        volumeId,
        chapterId,
        position,
        created_at: timestamp,
        updated_at: timestamp
      });
    }

    return {
      progressId,
      position,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving reading progress:', error);
    throw error;
  }
};

export const getReadingProgress = async (novelId, volumeId, chapterId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return null;
  }

  try {
    const progressId = `${novelId}_${volumeId}_${chapterId}`;
    
    const progressRef = doc(
      collection(db, 'users', userId, 'reading_progress'),
      progressId
    );
    
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return null;
    }

    const data = progressDoc.data();
    return {
      ...data,
      created_at: data.created_at?.toDate?.() ? data.created_at.toDate().toISOString() : null,
      updated_at: data.updated_at?.toDate?.() ? data.updated_at.toDate().toISOString() : null
    };
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    throw error;
  }
};

export const getUserReadingProgress = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user is logged in');
      return [];
    }

    const userId = user.uid;
    const progressCollectionRef = collection(db, 'users', userId, 'reading_progress');
    
    // First, get the most recent novels
    const novelsQuery = query(
      progressCollectionRef,
      orderBy('updated_at', 'desc')
    );
    
    const progressSnapshot = await getDocs(novelsQuery);
    
    if (progressSnapshot.empty) {
      console.log('No reading progress found');
      return [];
    }

    // Group by novelId and keep only the latest chapter for each novel
    const novelProgressMap = new Map();
    
    progressSnapshot.docs.forEach(doc => {
      const progressData = doc.data();
      
      // Skip invalid entries
      if (!progressData?.novelId || !progressData?.volumeId || !progressData?.chapterId) {
        console.log('Invalid progress data found:', doc.id);
        return;
      }

      const existingProgress = novelProgressMap.get(progressData.novelId);
      
      if (!existingProgress || 
          (progressData.updated_at && 
           existingProgress.updated_at && 
           progressData.updated_at.toDate() > existingProgress.updated_at.toDate())) {
        novelProgressMap.set(progressData.novelId, {
          ...progressData,
          id: doc.id
        });
      }
    });

    // Get the first 5 novels' latest progress
    const latestProgress = Array.from(novelProgressMap.values())
      .sort((a, b) => {
        // Safely handle timestamp comparison
        const dateA = a.updated_at?.toDate?.() || new Date(0);
        const dateB = b.updated_at?.toDate?.() || new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);

    // Fetch related data for each progress entry
    const progressList = await Promise.all(latestProgress.map(async (progressData) => {
      try {
        // Validate required fields
        if (!progressData?.novelId || !progressData?.volumeId || !progressData?.chapterId) {
          console.warn('Skipping invalid progress entry:', progressData);
          return null;
        }

        // Fetch novel data
        const novelRef = doc(db, 'novels', progressData.novelId);
        const novelDoc = await getDoc(novelRef);
        if (!novelDoc.exists()) {
          console.warn(`Novel not found: ${progressData.novelId}`);
          return null;
        }
        const novelData = novelDoc.data();

        // Fetch volume data
        const volumeRef = doc(db, 'novels', progressData.novelId, 'volumes', progressData.volumeId);
        const volumeDoc = await getDoc(volumeRef);
        if (!volumeDoc.exists()) {
          console.warn(`Volume not found: ${progressData.volumeId} for novel ${progressData.novelId}`);
          return null;
        }
        const volumeData = volumeDoc.data();

        // Fetch chapter data
        const chapterRef = doc(
          db, 
          'novels', 
          progressData.novelId, 
          'volumes', 
          progressData.volumeId, 
          'chapters', 
          progressData.chapterId
        );
        const chapterDoc = await getDoc(chapterRef);
        if (!chapterDoc.exists()) {
          console.warn(`Chapter not found: ${progressData.chapterId} for novel ${progressData.novelId}`);
          return null;
        }
        const chapterData = chapterDoc.data();

        // Convert timestamps safely
        const convertTimestamp = (timestamp) => {
          if (!timestamp) return null;
          try {
            if (timestamp.toDate) {
              return timestamp.toDate().toISOString();
            }
            if (timestamp._seconds) {
              return new Date(timestamp._seconds * 1000).toISOString();
            }
            return null;
          } catch (error) {
            console.log('Invalid timestamp:', timestamp);
            return null;
          }
        };

        // Construct the response object with null checks
        return {
          id: progressData.id || null,
          novelId: progressData.novelId,
          volumeId: progressData.volumeId,
          chapterId: progressData.chapterId,
          position: progressData.position || 0,
          novel: novelData ? {
            id: progressData.novelId,
            title: novelData.title || '',
            author: novelData.author || '',
            cover_url: novelData.cover_url || '',
            created_at: convertTimestamp(novelData.created_at),
            updated_at: convertTimestamp(novelData.updated_at),
            ...novelData
          } : null,
          volume: volumeData ? {
            id: progressData.volumeId,
            title: volumeData.title || '',
            volume_number: volumeData.volume_number || 0,
            ...volumeData
          } : null,
          chapter: chapterData ? {
            id: progressData.chapterId,
            title: chapterData.title || '',
            chapter_number: chapterData.chapter_number || 0,
            created_at: convertTimestamp(chapterData.created_at),
            last_modified: convertTimestamp(chapterData.last_modified),
            ...chapterData
          } : null,
          updated_at: convertTimestamp(progressData.updated_at),
          created_at: convertTimestamp(progressData.created_at)
        };
      } catch (error) {
        console.error(`Error processing progress data for novel ${progressData?.novelId}:`, error);
        return null;
      }
    }));

    // Filter out any null entries and return
    return progressList.filter(Boolean);

  } catch (error) {
    console.error('Error fetching reading progress:', error);
    throw error;
  }
};

export const fetchChapterData = async (novelId, volumeId, chapterId) => {
  try {
    const chapterDocRef = doc(
      db, 
      'novels', 
      novelId, 
      'volumes', 
      volumeId, 
      'chapters', 
      chapterId
    );
    const chapterDocSnapshot = await getDoc(chapterDocRef);

    if (chapterDocSnapshot.exists()) {
      const chapterData = chapterDocSnapshot.data();
      return {
        id: chapterDocSnapshot.id,
        ...chapterData,
        created_at: chapterData.created_at?.toDate?.() ? 
          chapterData.created_at.toDate().toISOString() : null,
        last_modified: chapterData.last_modified?.toDate?.() ? 
          chapterData.last_modified.toDate().toISOString() : null
      };
    }
    throw new Error('Chapter not found');
  } catch (error) {
    console.error('Error fetching chapter data:', error);
    throw error;
  }
};

const serializeTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return null;
};

const serializeObject = (obj) => {
  if (!obj) return null;
  
  const serialized = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value instanceof Timestamp || (value && value.seconds && value.nanoseconds)) {
      serialized[key] = serializeTimestamp(value);
    } else if (typeof value === 'object' && value !== null) {
      serialized[key] = serializeObject(value);
    } else {
      serialized[key] = value;
    }
  });
  return serialized;
};

export const NovelFirestoreService = {
  fetchGenres: async () => {
    try {
      const genresCollection = collection(db, 'genres'); // Reference to the genres collection
      const genreSnapshot = await getDocs(genresCollection); // Fetch all documents from the genres collection
      const genresList = genreSnapshot.docs.map(doc => doc.id); // Get genre names from document ids

      return genresList; // Return an array of genre names
    } catch (error) {
      console.error('Error fetching genres from Firestore:', error);
      throw new Error('Error fetching genres');
    }
  },
  addNovel: async (novelData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const userId = user.uid;
      console.log(novelData);

      const novelRef = collection(db, 'novels');
      const newNovel = await addDoc(novelRef, {
        ...novelData,
        created_by: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
  
      return { ...novelData, id: newNovel.id };
    } catch (error) {
      throw new Error('Error adding novel to Firestore: ' + error.message);
    }
  },
   async getVolumes(novelId) {
    const volumesRef = collection(db, 'novels', novelId, 'volumes');
    const q = query(volumesRef, orderBy('volume_number'));
    const volumeSnapshot = await getDocs(q);
    return volumeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

   async addVolume(novelId, volumeData) {
    const volumesRef = collection(db, 'novels', novelId, 'volumes');
    const newVolumeRef = doc(volumesRef);
    await setDoc(newVolumeRef, volumeData);
    return newVolumeRef; // Return the new volume reference for further use
  },

   async addChapter(novelId, volumeId, chapterData) {
    const chaptersRef = collection(db, 'novels', novelId, 'volumes', volumeId, 'chapters');
    const newChapterRef = doc(chaptersRef);
    await setDoc(newChapterRef, chapterData);
    return newChapterRef; // Return the new chapter reference for further use
  },

   async updateNovel(novelId, updateData) {
    const novelRef = doc(db, 'novels', novelId);
    await setDoc(novelRef, updateData, { merge: true });
  },

   async getNextChapterNumber(novelId, volumeId) {
    const chaptersRef = collection(db, 'novels', novelId, 'volumes', volumeId, 'chapters');
    const chapterSnapshot = await getDocs(chaptersRef);
    return chapterSnapshot.docs.length + 1; // Returns the next chapter number based on existing chapters
  },
  async getFirstChapterForNovel(novelId) {
    try {
      const chaptersRef = collection(db, 'novels', novelId, 'chapters');
      const chaptersQuery = query(
        chaptersRef,
        orderBy('created_at', 'asc'),
        limit(1)
      );
      
      let chaptersSnapshot = await getDocs(chaptersQuery);
      
      if (chaptersSnapshot.empty) {
        const volumesRef = collection(db, 'novels', novelId, 'volumes');
        const volumesQuery = query(
          volumesRef, 
          orderBy('created_at', 'asc'),
          limit(1)
        );
        const volumesSnapshot = await getDocs(volumesQuery);
        
        if (!volumesSnapshot.empty) {
          const firstVolume = volumesSnapshot.docs[0];
          const volumeChaptersRef = collection(
            db, 
            'novels', 
            novelId, 
            'volumes', 
            firstVolume.id, 
            'chapters'
          );
          
          const volumeChaptersQuery = query(
            volumeChaptersRef,
            orderBy('created_at', 'asc'),
            limit(1)
          );
          
          chaptersSnapshot = await getDocs(volumeChaptersQuery);
          
          if (!chaptersSnapshot.empty) {
            const firstChapter = chaptersSnapshot.docs[0];
            return {
              chapterId: firstChapter.id,
              volumeId: firstVolume.id,
              chapterData: serializeObject(firstChapter.data())
            };
          }
        }
      } else {
        const firstChapter = chaptersSnapshot.docs[0];
        return {
          chapterId: firstChapter.id,
          volumeId: null,
          chapterData: serializeObject(firstChapter.data())
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting first chapter:', error);
      throw error;
    }
  },

  async getFavoriteNovels(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      const snapshot = await getDocs(favoritesRef);

      const favoriteNovels = await Promise.all(
        snapshot.docs.map(async (favoriteDoc) => {
          const novelId = favoriteDoc.id;
          
          try {
            const novelRef = doc(db, 'novels', novelId);
            const novelSnapshot = await getDoc(novelRef);
            const novel = novelSnapshot.data();

            if (!novel) {
              console.warn(`Novel with ID ${novelId} not found`);
              return null;
            }

            const firstChapterInfo = await this.getFirstChapterForNovel(novelId);

            // Get reading progress
            const progressRef = collection(db, 'users', userId, 'reading_progress');
            const progressQuery = query(progressRef, where('novelId', '==', novelId));
            const progressSnapshot = await getDocs(progressQuery);

            let readingProgress = null;

            if (!progressSnapshot.empty) {
              const progressDocs = progressSnapshot.docs
                .map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }))
                .sort((a, b) => (b.updated_at?.seconds || 0) - (a.updated_at?.seconds || 0));

              if (progressDocs.length > 0) {
                const latestProgress = progressDocs[0];
                readingProgress = serializeObject(latestProgress);
              }
            }

            // Serialize the novel data
            const serializedNovel = serializeObject(novel);

            return {
              novelId,
              title: serializedNovel.title || 'Untitled',
              author: serializedNovel.author || 'Unknown',
              genres: serializedNovel.genres || 'N/A',
              coverImage: serializedNovel.cover_url || null,
              rating: serializedNovel.rating || 0,
              lastRead: readingProgress?.chapterId || null,
              updated_at: readingProgress?.updated_at || serializedNovel.updated_at,
              readingProgress,
              firstChapterId: firstChapterInfo?.chapterId || null,
              firstVolumeId: firstChapterInfo?.volumeId || null,
              firstChapterData: firstChapterInfo?.chapterData || null
            };
          } catch (error) {
            console.error(`Error processing novel ${novelId}:`, error);
            return null;
          }
        })
      );

      const validNovels = favoriteNovels.filter(novel => novel !== null);
      validNovels.sort((a, b) => {
        const dateA = new Date(a.updated_at || 0);
        const dateB = new Date(b.updated_at || 0);
        return dateB - dateA;
      });

      return validNovels;
    } catch (error) {
      console.error('Error in getFavoriteNovels:', error);
      throw error;
    }
  },
  
  async toggleFavoriteNovel(novelId) {
    if (!novelId) {
      throw new Error('Novel ID is required');
    }

    try {
      const userId = auth.currentUser.uid;
      const favoriteRef = doc(db, 'users', userId, 'favorites', novelId);
      const favoriteDoc = await getDoc(favoriteRef);
      const isFavorite = favoriteDoc.exists();

      if (isFavorite) {
        await deleteDoc(favoriteRef);
        return { 
          novelId, 
          isFavorite: false,
          timestamp: null
        };
      } else {
        const timestamp = serverTimestamp();
        await setDoc(favoriteRef, {
          novelId,
          timestamp,
        });
        return { 
          novelId, 
          isFavorite: true,
          timestamp: new Date().toISOString() // Use current time as an estimate
        };
      }
    } catch (error) {
      if (error.message === 'USER_NOT_AUTHENTICATED') {
        throw new Error('Please login to add favorites');
      }
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check if you have the necessary access.');
      }
      throw error;
    }
  },

  async getNovelsFavoriteStatus(novelIds) {
    if (!Array.isArray(novelIds) || novelIds.length === 0) {
      return {};
    }

    try {
      const userId = auth.currentUser.uid;
      const batch = [];
      
      for (const novelId of novelIds) {
        const favoriteRef = doc(db, 'users', userId, 'favorites', novelId);
        batch.push(getDoc(favoriteRef));
      }
      
      const docs = await Promise.all(batch);
      
      return docs.reduce((acc, doc, index) => {
        if (doc.exists()) {
          acc[novelIds[index]] = {
            isFavorite: true,
            timestamp: convertTimestampToISOString(doc.data().timestamp)
          };
        } else {
          acc[novelIds[index]] = {
            isFavorite: false,
            timestamp: null
          };
        }
        return acc;
      }, {});
    } catch (error) {
      if (error.message === 'USER_NOT_AUTHENTICATED') {
        return novelIds.reduce((acc, novelId) => {
          acc[novelId] = { isFavorite: false, timestamp: null };
          return acc;
        }, {});
      }
      if (error.code === 'permission-denied') {
        console.error('Permission denied checking favorites status. Please check Firestore rules.');
      }
      throw error;
    }
  },

  async isNovelFavorited(novelId) {
    if (!novelId) {
      throw new Error('Novel ID is required');
    }
  
    try {
      const userId = auth.currentUser.uid;
      const favoriteRef = doc(db, 'users', userId, 'favorites', novelId);
      const favoriteDoc = await getDoc(favoriteRef);
  
      if (favoriteDoc.exists()) {
        return true; 
      } else {
        return false;
      }
    } catch (error) {
      if (error.message === 'USER_NOT_AUTHENTICATED') {
        console.error('User not authenticated.');
        return false;
      }
  
      if (error.code === 'permission-denied') {
        console.error('Permission denied checking favorite status. Please check Firestore rules.');
        return false;
      }
  
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
  
};
///--end-novels-area--///
///-------


///--start-comments-area--///

export const addComment = async (novelId, volumeId, chapterId, commentData) => {
  try {
    if (!auth.currentUser) {
      throw new Error('User is not authenticated.');
    }

    const commentsRef = collection(
      db, 
      'novels', 
      novelId,
      'volumes',
      volumeId,
      'chapters',
      chapterId,
      'comments'
    );

    const newComment = {
      content: commentData.content,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      userAvatar: auth.currentUser.photoURL,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      replies: []
    };
    
    const docRef = await addDoc(commentsRef, newComment);
    return { id: docRef.id, ...newComment };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const addReply = async (chapterId, parentCommentId, replyData) => {
  try {
    const repliesRef = collection(
      db, 
      'chapters', 
      chapterId, 
      'comments', 
      parentCommentId, 
      'replies'
    );
    
    const newReply = {
      ...replyData,
      userId: auth.currentUser.id,
      userName: auth.currentUser.displayName,
      userAvatar: auth.currentUser.photoURL,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: []
    };

    const docRef = await addDoc(repliesRef, newReply);
    return { id: docRef.id, ...newReply };
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

export const getComments = async (chapterId) => {
  try {
    const commentsRef = collection(db, 'chapters', chapterId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const comments = [];
    for (const doc of querySnapshot.docs) {
      const comment = { id: doc.id, ...doc.data() };
      
      comment.likedBy = comment.likedBy || [];

      const repliesRef = collection(doc.ref, 'replies');
      const repliesSnapshot = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));
      
      comment.replies = repliesSnapshot.docs.map(replyDoc => {
        const reply = { id: replyDoc.id, ...replyDoc.data() };
        reply.likedBy = reply.likedBy || [];
        return reply;
      });
      
      comments.push(comment);
    }
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const toggleLike = async (chapterId, commentId, replyId = null) => {
  try {
    const userId = auth.currentUser.id;
    let docRef;
    
    if (replyId) {
      docRef = doc(db, 'chapters', chapterId, 'comments', commentId, 'replies', replyId);
    } else {
      docRef = doc(db, 'chapters', chapterId, 'comments', commentId);
    }
    
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    const likedBy = data.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    await updateDoc(docRef, {
      likes: increment(isLiked ? -1 : 1),
      likedBy: isLiked 
        ? likedBy.filter(id => id !== userId)
        : [...likedBy, userId]
    });
    
    return !isLiked;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

///--end-comments-area--///