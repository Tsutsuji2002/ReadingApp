import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { updateDoc, doc } from '@firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../../context/ThemeContext';

const STATUS_OPTIONS = ['Đang diễn ra', 'Hoàn thành', 'Tạm ngừng', 'Ngừng lại'];
const GENRE_OPTIONS = [
  'Hành động', 'Phiêu lưu', 'Hài hước', 'Hài kịch', 'Giả tưởng',
  'Kinh dị', 'Huyền bí', 'Lãng mạn', 'Khoa học viễn tưởng', 'Cuộc sống thường nhật'
];

const EditNovel = ({ route, navigation }) => {
  const { novel } = route.params;
  const { theme } = useContext(ThemeContext);

  // Novel basic info
  const [title, setTitle] = useState(novel.title);
  const [author, setAuthor] = useState(novel.author);
  const [artist, setArtist] = useState(novel.artist);
  const [coverUrl, setCoverUrl] = useState(novel.cover_url);
  const [description, setDescription] = useState(novel.description);
  const [status, setStatus] = useState(novel.status);
  const [selectedGenres, setSelectedGenres] = useState(novel.genres || []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setCoverUrl(result.assets[0].uri);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSave = async () => {
    try {
      const novelRef = doc(db, 'novels', novel.novelId);
      await updateDoc(novelRef, {
        title,
        author,
        artist,
        cover_url: coverUrl,
        description,
        genres: selectedGenres,
        status,
        updated_at: new Date(),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating novel:', error);
    }
  };

  return (
    <ScrollView style={[tw.flex1, { backgroundColor: theme.screens }]}>
      <View style={[tw.p4]}>
        {/* Cover Image Section */}
        <View style={[tw.flexRow, tw.mb4, tw.justifyCenter]}>
          <TouchableOpacity onPress={pickImage}>
            {coverUrl ? (
              <Image 
                source={{ uri: coverUrl }} 
                style={[tw.h48, tw.w32, tw.roundedLg]} 
              />
            ) : (
              <View style={[tw.h48, tw.w32, { backgroundColor: theme.comp }, tw.roundedLg, tw.itemsCenter, tw.justifyCenter]}>
                <MaterialIcons name="add-photo-alternate" size={40} color="gray" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={[{ backgroundColor: theme.comp }, tw.roundedLg, tw.p4, tw.mb4]}>
          <Text style={[tw.textLg, tw.fontBold, tw.mb2, { color: theme.text }]}>Thông tin cơ bản</Text>
          
          <Text style={[{ color: theme.text }, tw.mb1]}>Tiêu đề</Text>
          <TextInput
            style={[tw.border, tw.borderGray300, tw.rounded, tw.p2, tw.mb3]}
            value={title}
            onChangeText={setTitle}
            placeholder="Tiêu đề tiểu thuyết"
          />

          <Text style={[{ color: theme.text }, tw.mb1]}>Tác giả</Text>
          <TextInput
            style={[tw.border, tw.borderGray300, tw.rounded, tw.p2, tw.mb3]}
            value={author}
            onChangeText={setAuthor}
            placeholder="Tên tác giả"
          />

          <Text style={[{ color: theme.text }, tw.mb1]}>Họa sĩ</Text>
          <TextInput
            style={[tw.border, tw.borderGray300, tw.rounded, tw.p2, tw.mb3]}
            value={artist}
            onChangeText={setArtist}
            placeholder="Tên họa sĩ"
          />

          <Text style={[{ color: theme.text }, tw.mb1]}>Mô tả</Text>
          <TextInput
            style={[tw.border, tw.borderGray300, tw.rounded, tw.p2, tw.mb3, tw.h24]}
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả tiểu thuyết"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Status Section */}
        <View style={[{ backgroundColor: theme.comp }, tw.roundedLg, tw.p4, tw.mb4]}>
          <Text style={[tw.textLg, tw.fontBold, tw.mb2, { color: theme.text }]}>Trạng thái</Text>
          <View style={[tw.border, tw.borderGray300, tw.rounded]}>
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={[tw.h12]}
            >
              {STATUS_OPTIONS.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Genres Section */}
        <View style={[{ backgroundColor: theme.comp }, tw.roundedLg, tw.p4, tw.mb4]}>
          <Text style={[tw.textLg, tw.fontBold, tw.mb2, { color: theme.text }]}>Thể loại</Text>
          <View style={[tw.flexRow, tw.flexWrap]}>
            {GENRE_OPTIONS.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[ 
                  tw.m1, tw.px3, tw.py1, tw.rounded,
                  selectedGenres.includes(genre) ? { backgroundColor: theme.buttons } : { backgroundColor: theme.extraComp }
                ]}
                onPress={() => toggleGenre(genre)}
              >
                <Text 
                  style={[ 
                    selectedGenres.includes(genre) ? { color: theme.buttonstext } : { color: theme.text }
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[{ backgroundColor: theme.buttons }, tw.p3, tw.roundedLg, tw.mb4]} 
          onPress={handleSave}
        >
          <Text style={[tw.textWhite, tw.textCenter, tw.fontBold]}>
            Lưu thay đổi
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditNovel;
