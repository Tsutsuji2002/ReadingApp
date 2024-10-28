import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, PanResponder } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchChapterContent, clearCurrentChapter, saveReadingPosition, getReadingPosition, fetchNovelById } from '../../../redux/reducers/novelSlice';
import { ThemeContext } from '../../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { tw } from 'react-native-tailwindcss';
import ChapterCommentsModal from '../../../modals/ChapterCommentsModal';

const SCROLL_DEBOUNCE_TIME = 1000; // Save position every 1 second
const SHOW_SCROLL_BUTTON_THRESHOLD = 200;

const ChapterScreen = ({ route }) => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const { currentChapter, isLoading, error } = useSelector((state) => state.novels);
  
  const [fontSize, setFontSize] = useState(16);
  const scrollViewRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const screenHeight = Dimensions.get('window').height;
  const [contentHeight, setContentHeight] = useState(0);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [fetchedNovel, setFetchedNovel] = useState(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [initialScrollComplete, setInitialScrollComplete] = useState(false);

  const { 
    novelId = null, 
    volumeId = null, 
    chapterId = null,
    chapter = {},
    novel = null
  } = route.params || {};

  const savePosition = useCallback(() => {
    const currentPosition = scrollPositionRef.current;
    if (currentPosition >= 0) {
      dispatch(saveReadingPosition({
        novelId,
        volumeId,
        chapterId,
        position: currentPosition
      }));
    }
  }, [dispatch, novelId, volumeId, chapterId]);

  // Debounced scroll handler
  const handleScroll = useCallback((event) => {
    const position = event.nativeEvent.contentOffset.y;
    scrollPositionRef.current = position;
    setShowScrollTopButton(position > SHOW_SCROLL_BUTTON_THRESHOLD);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout
    scrollTimeoutRef.current = setTimeout(() => {
      savePosition();
    }, SCROLL_DEBOUNCE_TIME);
  }, [savePosition]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        if (!novelId || !volumeId || !chapterId) {
          console.error('Missing required navigation parameters:', { novelId, volumeId, chapterId });
          navigation.goBack();
          return;
        }

        try {
          await dispatch(fetchChapterContent({ novelId, volumeId, chapterId })).unwrap();
          const savedPosition = await dispatch(getReadingPosition({ novelId, volumeId, chapterId })).unwrap();
          
          if (savedPosition && scrollViewRef.current && !initialScrollComplete) {
            setTimeout(() => {
              scrollViewRef.current.scrollTo({ 
                y: savedPosition.position, 
                animated: false 
              });
              setInitialScrollComplete(true);
            }, 100);
          }
        } catch (err) {
          console.error('Error in fetching chapter data:', err);
        }
      };

      fetchData();

      return () => {
        // Clear any pending timeouts
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        // Save final position when leaving
        savePosition();
        dispatch(clearCurrentChapter());
      };
    }, [novelId, volumeId, chapterId, savePosition])
  );

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useEffect(() => {
    if (!novel && novelId) {
      const fetchNovelData = async () => {
        try {
          const novelData = await dispatch(fetchNovelById(novelId)).unwrap();
          setFetchedNovel(novelData);
        } catch (err) {
          console.error('Error fetching novel:', err);
        }
      };

      fetchNovelData();
    }
  }, [novel, novelId, dispatch]);

  const displayedNovel = novel || fetchedNovel;

  const renderContent = useCallback((content) => {
    if (!content) return 'No content available';

    const cleanContent = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
      .replace(/&lsquo;|&rsquo;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/<[^>]*>/g, '');

    const paragraphs = cleanContent
      .split('\n')
      .filter(para => para.trim() !== '');

    return (
      <View style={[tw.flex1, { paddingHorizontal: 8 }]}>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={[tw.textBase, {
              fontSize: fontSize,
              color: theme.text,
              lineHeight: fontSize * 1.5,
              marginBottom: 16,
              textAlign: 'justify',
              paddingHorizontal: 2,
              letterSpacing: 0.5,
            }]}
          >
            {paragraph.trim()}
          </Text>
        ))}
      </View>
    );
  }, [fontSize, theme.text]);

  const renderChapterContent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter]}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p4]}>
          <Text style={[tw.textLg, tw.textCenter, { color: theme.text }]}>
            {error}
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={[tw.mT4, tw.p2, tw.roundedLg, { backgroundColor: theme.buttons }]}
          >
            <Text style={[tw.textBase, { color: theme.text }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!currentChapter) {
      return (
        <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter]}>
          <Text style={[tw.textLg, { color: theme.text }]}>No chapter content available</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={[tw.text2xl, tw.fontBold, tw.p4, { color: theme.text }]}>
          {currentChapter.chapter_number}: {currentChapter.title || chapter.title || 'Untitled Chapter'}
        </Text>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[tw.p4, { paddingHorizontal: 12 }]}
          onContentSizeChange={(width, height) => setContentHeight(height)}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
        >
          {renderContent(currentChapter.content)}
        </ScrollView>
      </>
    );
  }, [currentChapter, isLoading, error, handleScroll, theme, chapter.title, navigation]);

  return (
    <View style={[tw.flex1, { backgroundColor: theme.screens }]}>
      {renderChapterContent()}

      <View style={[tw.flexRow, tw.justifyBetween, tw.p4, tw.borderT, { borderColor: theme.buttons }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw.flexRow}>
          <Icon name="chevron-back" size={24} color={theme.text} />
          <Text style={[tw.textBase, tw.mL1, { color: theme.text }]}>Previous</Text>
        </TouchableOpacity>

        <View style={[tw.flexRow, tw.spaceX4]}>
          <TouchableOpacity onPress={() => navigation.navigate('NovelDetail', { novel: fetchedNovel })} style={tw.mX2}>
            <Icon name="home-outline" size={24} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFontSize(prev => Math.min(prev + 2, 24))} style={tw.mX2}>
            <Text style={[tw.textBase, { color: theme.text }]}>A+</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFontSize(prev => Math.max(prev - 2, 12))} style={tw.mX2}>
            <Text style={[tw.textBase, { color: theme.text }]}>A-</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsCommentModalVisible(true)} style={tw.mX2}>
            <Icon name="chatbubble-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showScrollTopButton && (
        <View style={[tw.absolute, { bottom: 80, right: 20, zIndex: 10 }]}>
          <BlurView intensity={50} style={[tw.roundedFull]}>
            <TouchableOpacity onPress={scrollToTop}>
              <Icon name="chevron-up" size={30} color={theme.text} />
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      <ChapterCommentsModal
        isVisible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        chapterId={chapterId}
        novelId={novelId}
        volumeId={volumeId} 
        navigation={navigation}
      />
    </View>
  );
};

export default React.memo(ChapterScreen);