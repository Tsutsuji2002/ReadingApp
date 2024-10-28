import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../../../context/ThemeContext';
import { db } from '../../../../firebaseConfig';
import { collection, getDocs, query } from 'firebase/firestore';

const ManageChaptersScreen = ({ route, navigation }) => {
  const { novelId, title } = route.params;
  const { theme } = useContext(ThemeContext);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true);
      try {
        const chaptersRef = collection(db, 'novels', novelId, 'chapters');
        const q = query(chaptersRef);
        const chapterSnapshots = await getDocs(q);
        
        const chaptersData = chapterSnapshots.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [novelId]);

  const handleAddChapter = () => {
    navigation.navigate('AddChapterScreen', { novelId : novelId });
  };

  const renderChapterItem = ({ item }) => (
    <View style={styles.chapterItem}>
      <Text style={[styles.chapterTitle, { color: theme.text }]}>{item.title}</Text>
      <TouchableOpacity 
        style={[styles.editButton, { backgroundColor: theme.buttons }]} 
        onPress={() => navigation.navigate('EditChapter', { chapterId: item.id })}
      >
        <Text style={{ color: theme.buttonstext }}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.screens }]}>
      <Text style={[styles.title, { color: theme.text }]}>Quản lý chương cho "{title}"</Text>
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.buttons }]} 
        onPress={handleAddChapter}
      >
        <Text style={{ color: theme.buttonstext }}>Thêm chương mới</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : (
        <FlatList
          data={chapters}
          renderItem={renderChapterItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  chapterItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 18,
  },
  editButton: {
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default ManageChaptersScreen;
