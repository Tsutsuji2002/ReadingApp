import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { ThemeContext } from '../../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { postNovel } from '../../../redux/reducers/novelSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { NovelFirestoreService } from '../../../../firestoreService';
import { useAuth } from '../../../context/AuthContext';
import { storage } from '../../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import * as FileSystem from 'expo-file-system';

const PostNovelScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userId } = useAuth();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getGenres = async () => {
      const genresList = await NovelFirestoreService.fetchGenres();
      setGenres(genresList);
    };
    getGenres();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images!'
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000
      });

      if (!result.canceled && result.assets[0]) {
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        const fileSize = fileInfo.size;
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (fileSize > maxSize) {
          Alert.alert(
            'File Too Large',
            'Please select an image smaller than 5MB'
          );
          return;
        }

        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setIsUploading(true);
      
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const filename = `covers/${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const storageRef = ref(storage, filename);

      // Upload blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      setCoverImage(downloadURL);
      setIsUploading(false);

    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !author || selectedGenres.length === 0 || !description || !coverImage) {
      Alert.alert('Missing Information', 'Please fill in all required fields and upload a cover image');
      return;
    }
  
    setIsLoading(true);
    const novelData = {
      title,
      author,
      genres: selectedGenres,
      description,
      cover_url: coverImage,
      status: 'draft',
      rating: 0,
      total_chapters: 0,
    };
  
    try {
      // Dispatch postNovel action
      const response = await dispatch(postNovel(novelData));
  
      if (postNovel.fulfilled.match(response)) {
        navigation.navigate('AddChapterScreen', { novelData: response.payload });
      } else {
        Alert.alert('Error', response.payload || 'Failed to post novel');
      }
  
    } catch (error) {
      console.error('Error posting novel:', error);
      Alert.alert('Error', 'Failed to post novel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGenreSelection = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.screens }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>Đăng Novel Mới</Text>

      {/* Title */}
      <TextInput
        style={[styles.input, { backgroundColor: theme.comp, color: theme.text }]}
        placeholder="Nhập tiêu đề"
        placeholderTextColor={theme.text + '80'}
        value={title}
        onChangeText={setTitle}
      />

      {/* Author */}
      <TextInput
        style={[styles.input, { backgroundColor: theme.comp, color: theme.text }]}
        placeholder="Nhập tên tác giả"
        placeholderTextColor={theme.text + '80'}
        value={author}
        onChangeText={setAuthor}
      />

      {/* Genres */}
      <Text style={[styles.label, { color: theme.text }]}>Thể loại</Text>
      <TouchableOpacity 
        style={styles.toggleGenresButton} 
        onPress={() => setShowGenres(prevState => !prevState)}
      >
        <Text style={[styles.selectedGenresText, { color: theme.text }]}>
          {selectedGenres.length > 0 ? `Đã chọn: ${selectedGenres.join(', ')}` : 'Chưa chọn thể loại'}
        </Text>
        <Icon name={showGenres ? "chevron-up" : "chevron-down"} size={20} color={theme.text} />
      </TouchableOpacity>

      {showGenres && (
        <View style={styles.genresContainer}>
          {genres.map(genre => (
            <TouchableOpacity
              key={genre}
              style={[ 
                styles.genreButton, 
                { backgroundColor: selectedGenres.includes(genre) ? theme.buttons : theme.extracomp }
              ]}
              onPress={() => toggleGenreSelection(genre)}
            >
              <Text style={{ color: theme.buttonstext }}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Description */}
      <TextInput
        style={[styles.input, styles.descriptionInput, { backgroundColor: theme.comp, color: theme.text }]}
        placeholder="Mô tả"
        placeholderTextColor={theme.text + '80'}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Cover Image */}
      <Text style={[styles.label, { color: theme.text }]}>Ảnh Bìa</Text>
      <View style={styles.imagePickerContainer}>
        {coverImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: coverImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => setCoverImage('')}
            >
              <Text style={styles.removeButtonText}>Xóa ảnh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.uploadButton, { backgroundColor: theme.buttons }]}
            onPress={pickImage}
            disabled={isUploading}
          >
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Đang tải lên...' : 'Chọn ảnh bìa'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { 
          backgroundColor: theme.buttons,
          opacity: isLoading || isUploading ? 0.5 : 1
        }]}
        onPress={handleSubmit}
        disabled={isLoading || isUploading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Đang đăng...' : 'Đăng Novel'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  toggleGenresButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedGenresText: {
    fontSize: 16,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genreButton: {
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  imagePickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButton: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostNovelScreen;