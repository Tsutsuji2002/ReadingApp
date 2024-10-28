import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemeContext } from '../../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NovelFirestoreService } from '../../../../firestoreService';
import { useAuth } from '../../../context/AuthContext';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { storage } from '../../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';

const AddChapterScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = useAuth();
  const { novelId } = route.params; 

  const editorRef = useRef();
  const [volumes, setVolumes] = useState([]);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [newVolumeTitle, setNewVolumeTitle] = useState('');
  const [newVolumeNumber, setNewVolumeNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVolumeInput, setShowVolumeInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchVolumes();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Yêu cầu quyền truy cập',
        'Cần quyền truy cập thư viện ảnh để tải ảnh lên!'
      );
    }
  };

  const handleInsertImage = async () => {
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
            'File quá lớn',
            'Vui lòng chọn ảnh nhỏ hơn 5MB'
          );
          return;
        }

        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setIsUploading(true);
      
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const filename = `editor-images/${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const storageRef = ref(storage, filename);

      // Upload blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Insert the image into the editor
      editorRef.current?.insertImage(downloadURL);
      setIsUploading(false);

    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
      setIsUploading(false);
    }
  };

  const fetchVolumes = async () => {
    try {
      const fetchedVolumes = await NovelFirestoreService.getVolumes(novelId);
      setVolumes(fetchedVolumes);
      if (fetchedVolumes.length > 0) {
        setSelectedVolume(fetchedVolumes[0].id);
      }
    } catch (error) {
      console.error('Error fetching volumes:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách tập');
    }
  };

  const createNewVolume = async () => {
    if (!newVolumeTitle.trim() && !newVolumeNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hoặc số tập');
      return;
    }

    try {
      const volumeData = {
        title: newVolumeTitle.trim() || `Tập ${newVolumeNumber}`, 
        volume_number: newVolumeNumber.trim() || "1", 
        novel_id: novelId,
      };

      const newVolume = await NovelFirestoreService.addVolume(novelId, volumeData);
      setVolumes([...volumes, { ...volumeData, id: newVolume.id }]);
      setSelectedVolume(newVolume.id);
      setShowVolumeInput(false);
      setNewVolumeTitle('');
      setNewVolumeNumber('');
    } catch (error) {
      console.error('Error creating new volume:', error);
      Alert.alert('Lỗi', 'Không thể tạo tập mới');
    }
  };

  const handleSubmit = async () => {
    if (!selectedVolume || !chapterTitle.trim() || !chapterNumber.trim() || !chapterContent.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tất cả các trường');
      return;
    }

    setIsLoading(true);
    try {
      const chapterData = {
        title: chapterTitle,
        chapter_number: chapterNumber,
        content: chapterContent,
        word_count: chapterContent.replace(/<[^>]+>/g, '').trim().split(/\s+/).length,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        volume_id: selectedVolume,
        novel_id: novelId,
      };

      await NovelFirestoreService.addChapter(novelId, selectedVolume, chapterData);
      await NovelFirestoreService.updateNovel(novelId, {
        updated_at: new Date().toISOString(),
      });

      Alert.alert(
        'Thành công',
        'Chương đã được thêm thành công!',
        [
          {
            text: 'Thêm chương khác',
            onPress: () => {
              setChapterTitle('');
              setChapterNumber('');
              setChapterContent('');
              editorRef.current?.setContentHTML('');
            }
          },
          {
            text: 'Xong',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('Error adding chapter:', error);
      Alert.alert('Lỗi', 'Không thể thêm chương');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={[styles.container, { backgroundColor: theme.screens }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>Thêm chương mới</Text>

        <View style={styles.volumeSection}>
          <Text style={[styles.label, { color: theme.text }]}>Tạo tập mới</Text>
          {showVolumeInput && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: theme.comp, color: theme.text }]}
                placeholder="Nhập tên tập"
                placeholderTextColor={theme.placeholder}
                value={newVolumeTitle}
                onChangeText={setNewVolumeTitle}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.comp, color: theme.text }]}
                placeholder="Nhập số tập"
                placeholderTextColor={theme.placeholder}
                value={newVolumeNumber}
                onChangeText={setNewVolumeNumber}
              />
              <TouchableOpacity
                style={[styles.createVolumeButton, { backgroundColor: theme.buttons }]}
                onPress={createNewVolume}
              >
                <Text style={styles.buttonText}>Tạo tập</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity
            style={[styles.addVolumeButton, { backgroundColor: theme.buttons }]}
            onPress={() => setShowVolumeInput(!showVolumeInput)}
          >
            <Text style={styles.buttonText}>{showVolumeInput ? 'Hủy' : 'Thêm tập mới'}</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: theme.text }]}>Chọn tập</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.comp }]}>
            <Picker
              selectedValue={selectedVolume}
              onValueChange={setSelectedVolume}
              style={{ color: theme.text }}
            >
              {volumes.map(volume => (
                <Picker.Item
                  key={volume.id}
                  label={`Tập ${volume.volume_number}: ${volume.title}`}
                  value={volume.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Tiêu đề chương</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.comp, color: theme.text }]}
          placeholder="Tiêu đề chương"
          placeholderTextColor={theme.placeholder}
          value={chapterTitle}
          onChangeText={setChapterTitle}
        />

        <Text style={[styles.label, { color: theme.text }]}>Số chương</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.comp, color: theme.text }]}
          placeholder="Số chương"
          placeholderTextColor={theme.placeholder}
          value={chapterNumber}
          onChangeText={setChapterNumber}
          keyboardType="text"
        />

        <Text style={[styles.label, { color: theme.text }]}>Nội dung chương</Text>
        <View style={{ minHeight: 200 }}>
          <RichEditor
            ref={editorRef}
            style={styles.richEditor}
            onChange={setChapterContent}
            placeholder="Viết nội dung chương ở đây..."
            disabled={isUploading}
          />
          <RichToolbar
            editor={editorRef}
            actions={[
              'bold',
              'italic',
              'underline',
              'insertOrderedList',
              'insertUnorderedList',
              'strikethrough',
              'heading1',
              'heading2',
              'heading3',
              'justifyLeft',
              'justifyCenter',
              'justifyRight',
              'insertLink',
              'insertImage',
              'removeFormat'
            ]}
            style={styles.toolbar}
            selectedIconTint={'#000000'}
            disabledIconTint={'#aaaaaa'}
            iconSize={28}
            unselectedButtonStyle={{ backgroundColor: '#f0f0f0' }}
            selectedButtonStyle={{ backgroundColor: '#d0d0d0' }}
            disabledButtonStyle={{ backgroundColor: '#e0e0e0' }}
            onPressAddLink={() => editorRef.current?.insertLink()}
            onRemoveLink={() => editorRef.current?.unlink()}
            onInsertImage={handleInsertImage}
            disabled={isUploading}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: theme.buttons,
            opacity: (isLoading || isUploading) ? 0.5 : 1 
          }]}
          onPress={handleSubmit}
          disabled={isLoading || isUploading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.buttonstext} />
          ) : (
            <Text style={styles.buttonText}>
              {isUploading ? 'Đang tải ảnh...' : 'Gửi chương'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  volumeSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addVolumeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  createVolumeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    fontSize: 16,
  },
  richEditor: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 150,
  },
  toolbar: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 8,
    flex: 1
  },
  submitButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default AddChapterScreen;