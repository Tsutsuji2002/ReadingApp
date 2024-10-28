import React, { useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../context/ThemeContext';
import { NewNovelCard } from './NewNovelCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNovels } from '../../redux/reducers/novelSlice';

const NewNovelList = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  
  const dispatch = useDispatch();
  
  const { novels: books, isLoading } = useSelector((state) => state.novels);

  useEffect(() => {
    dispatch(fetchNovels());
  }, [dispatch]);

  return (
    <View style={[tw.p4]}>
      <View style={[tw.flexRow, tw.justifyBetween, tw.itemsCenter, tw.mB3]}>
        <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>
          Tiểu thuyết mới ra mắt
        </Text>

        <TouchableOpacity
          style={[tw.flexRow, tw.itemsCenter]}
          onPress={() => navigation.navigate('NewNovel')}
        >
          <Text style={[tw.textSm, tw.mR1, { color: theme.text }]}>
            Xem toàn bộ
          </Text>
          <Icon name="chevron-forward" size={16} color={theme.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tw.flexGrow0}
          contentContainerStyle={tw.pB2}
        >
          {books.map((book) => (
            <NewNovelCard
              key={book.id}
              book={book}
              onPress={() => {
                navigation.navigate('NovelDetail', { novel: book });
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default NewNovelList;
