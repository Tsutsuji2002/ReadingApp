import React, { useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeContext } from '../../context/ThemeContext';
import { tw } from 'react-native-tailwindcss';
import { ChapterCard } from './ChapterCard';
import { fetchReadingProgress } from '../../redux/reducers/novelSlice';
import { useNavigation } from '@react-navigation/native';

const RecentlyReadList = () => {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { readingProgress, isLoading, error } = useSelector(state => state.novels);

  useEffect(() => {
    dispatch(fetchReadingProgress());
  }, [dispatch]);

  if (isLoading) {
    return <ActivityIndicator size="large" color={theme.text} />;
  }

  if (error) {
    console.error('Error fetching reading progress:', error);
    return (
      <View>
        <Text style={[tw.textLg, tw.fontBold, tw.mB3, { color: theme.text }]}>
          Đã có lỗi khi tải dữ liệu.
        </Text>
      </View>
    );
  }

  if (!readingProgress || readingProgress.length === 0) {
    return (
      <View style={[tw.p4]}>
        <Text style={[tw.textLg, tw.fontBold, tw.mB3, { color: theme.text }]}>
          Có vẻ như bạn chưa đọc truyện nào gần đây
        </Text>
      </View>
    );
  }

  const handleChapterPress = (book) => {
    // Validate required data before navigation
    if (!book?.novelId || !book?.volumeId || !book?.chapterId) {
      console.warn('Missing required navigation parameters:', book);
      return;
    }

    navigation.navigate('ChapterScreen', {
      novelId: book.novelId,
      volumeId: book.volumeId,
      chapterId: book.chapterId,
      chapter: book.chapter || null
    });
  };

  return (
    <View style={[tw.p4]}>
      <Text style={[tw.textLg, tw.fontBold, tw.mB3, { color: theme.text }]}>
        Đã xem gần đây
      </Text>
  
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tw.flexGrow0}
        contentContainerStyle={tw.pB2}
      >
        {readingProgress.map((book, index) => {
          // Skip invalid entries
          if (!book?.novelId || !book?.volumeId || !book?.chapterId) {
            console.warn('Invalid book data:', book);
            return null;
          }

          return (
            <ChapterCard
              key={`${book.novelId}-${book.chapterId}-${index}`}
              book={{
                ...book,
                chapnum: book.chapter?.chapter_number ?? 'N/A',
                title: book.novel?.title ?? 'Không tìm thấy truyện',
                latestChapter: book.chapter?.title ?? 'Không tìm thấy chương',
                coverImage: book.novel?.cover_url ?? 'https://via.placeholder.com/300x450',
                progress: book.position ? (book.position / 1000) : 0,
              }}
              onPress={() => handleChapterPress(book)}
            />
          );
        }).filter(Boolean)}
      </ScrollView>
    </View>
  );
};

export default RecentlyReadList;