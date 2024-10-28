import React, { useState, useContext, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../../context/ThemeContext';
import { useResponsiveContext } from '../../../context/ResponsiveContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVolumesAndChapters, checkNovelFavoriteStatus, toggleFavorite, selectFavoriteStatus, selectIsLoading, selectError  } from '../../../redux/reducers/novelSlice';
import CommentsModal from '../../../modals/CommentsModal';
import ShareModal from '../../../modals/ShareModal';
import { auth } from '../../../../firebaseConfig';

const ActionButton = memo(({ icon, label, onPress, theme }) => (
  <TouchableOpacity
    style={[tw.flexCol, tw.itemsCenter, tw.justifyCenter, tw.p2, { flex: 1 }]}
    onPress={onPress}>
    <View style={[tw.roundedFull, tw.p3, { backgroundColor: theme.comp }]}>
      <Icon name={icon} size={22} color={theme.text} />
    </View>
    <Text style={[tw.textXs, tw.mT2, { color: theme.text + '80' }]}>{label}</Text>
  </TouchableOpacity>
));

const ChapterItem = memo(({ chapter, theme, onPress }) => (
  <TouchableOpacity
    style={[tw.p4, tw.flexRow, tw.itemsCenter, tw.justifyBetween, { 
      backgroundColor: theme.comp, 
      marginBottom: 1, 
      borderRadius: 8 
    }]}
    onPress={onPress}
  >
    <View style={[tw.flexRow, tw.itemsCenter]}>
      <Text style={[tw.textBase, tw.mL3, { color: theme.text }]}>
        {chapter.chapter_number}: {chapter.title}
      </Text>
    </View>
    <Icon name="chevron-forward" size={20} color={theme.text + '80'} />
  </TouchableOpacity>
));

const VolumeItem = memo(({ item, expandedVolume, theme, onToggle, onChapterPress }) => (
  <View style={[tw.mB4]}>
    <TouchableOpacity
      onPress={() => onToggle(item.id)}
      style={[tw.p4, tw.flexRow, tw.justifyBetween, tw.itemsCenter, {
        backgroundColor: expandedVolume === item.id ? theme.buttons : theme.comp,
        borderRadius: 12,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }]}>
      <View>
        <Text style={[tw.textLg, tw.fontBold, { 
          color: expandedVolume === item.id ? theme.buttonstext : theme.text 
        }]}>
          {item.title}
        </Text>
        <Text style={[tw.textSm, { 
          color: expandedVolume === item.id ? theme.buttonstext + '80' : theme.text + '60',
          marginTop: 4 
        }]}>
          {item.chapters.length} Chương
        </Text>
      </View>
      <View style={[tw.roundedFull, tw.p2, { 
        backgroundColor: expandedVolume === item.id ? 'rgba(255,255,255,0.2)' : theme.extracomp + '20' 
      }]}>
        <Icon 
          name={expandedVolume === item.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={expandedVolume === item.id ? theme.buttonstext : theme.text} 
        />
      </View>
    </TouchableOpacity>
    {expandedVolume === item.id && (
      <View style={[tw.mT2]}>
        {item.chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            theme={theme}
            onPress={() => onChapterPress(chapter, item.id)}
          />
        ))}
      </View>
    )}
  </View>
));

const NovelDetailScreen = ({ route }) => {
  const { theme } = useContext(ThemeContext);
  const { width } = useResponsiveContext();
  const { novel } = route.params;
  const novelId = route.params?.novelId || route.params?.novel?.id;
  const [expandedVolume, setExpandedVolume] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { volumes, isLoading, error } = useSelector((state) => state.novels);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const coverWidth = width * 0.35;
  const coverHeight = coverWidth * 1.5;

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!novelId) {
      Alert.alert(
        'Error',
        'Novel information is missing',
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    }
  }, [novelId, navigation]);

  const handleFavoriteToggle = useCallback(async () => {
    if (!userId) {
      Alert.alert(
        'Login Required',
        'Please login to add favorites',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    if (!novelId) {
      Alert.alert('Error', 'Novel information is missing');
      return;
    }

    try {
      await dispatch(toggleFavorite(novelId)).unwrap();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update favorite status'
      );
    }
  }, [userId, novelId, dispatch, navigation]);

  const handleVolumeToggle = useCallback((volumeId) => {
    setExpandedVolume(prev => (prev === volumeId ? null : volumeId));
  }, []);

  const handleChapterPress = useCallback((chapter, volumeId) => {
    navigation.navigate('ChapterScreen', {
      novelId: novel.id,
      volumeId: volumeId,
      chapterId: chapter.id,
      chapter: chapter
    });
  }, [novel.id, navigation]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userId || !novelId) return;
  
      try {
        const response = await dispatch(checkNovelFavoriteStatus(novelId)).unwrap();
        console.log('Favorite status checked:', response);
      } catch (error) {
        console.error('Error checking favorite status:', error);
        Alert.alert('Error', 'Failed to check favorite status');
      }
    };
  
    checkFavoriteStatus();
  }, [userId, novelId, dispatch]);
  
  const isFavorite = useSelector(state =>
    state.novels.favorites.byId[novelId]?.isFavorite || false
  );
  
  useEffect(() => {
    let mounted = true;
    
    const loadVolumes = async () => {
      if (mounted) {
        await dispatch(fetchVolumesAndChapters(novel.id));
      }
    };

    loadVolumes();

    return () => {
      mounted = false;
    };
  }, [dispatch, novel.id]);

  if (!novelId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.errorText, { color: theme.textColor }]}>
          Error: Novel information is missing
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor: theme.screens }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor: theme.screens }]}>
        <Text style={{ color: theme.text }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[tw.flex1, { backgroundColor: theme.screens }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Novel Info Section */}
      <View style={[tw.p6, { 
        backgroundColor: theme.comp, 
        borderBottomLeftRadius: 24, 
        borderBottomRightRadius: 24 
      }]}>
        {/* Cover and Details */}
        <View style={[tw.flexRow]}>
          <Image
            source={{ uri: novel.cover_url }}
            style={[{ 
              width: coverWidth, 
              height: coverHeight, 
              borderRadius: 16, 
              marginRight: 16 
            }, tw.shadow2xl]}
            resizeMode="cover"
          />
          {/* Novel Details */}
          <View style={[tw.flex1, tw.justifyBetween]}>
            <Text style={[tw.text2xl, tw.fontBold, { color: theme.text }]}>
              {novel.title}
            </Text>
            {/* Genres */}
            <View style={[tw.flexRow, tw.flexWrap, tw.mT2]}>
              {novel.genres.map((genre, index) => (
                <View 
                  key={index} 
                  style={[tw.mR2, tw.mB2, tw.pX3, tw.pY1, tw.rounded, { 
                    backgroundColor: theme.extracomp + '30' 
                  }]}
                >
                  <Text style={[tw.textXs, { color: theme.text }]}>{genre}</Text>
                </View>
              ))}
            </View>
            {/* Author Info */}
            <View style={[tw.mT4]}>
              <Text style={[tw.textSm, { color: theme.text + '80', marginBottom: 4 }]}>
                Tác giả: <Text style={{ color: theme.text }}>{novel.author}</Text>
              </Text>
              <Text style={[tw.textSm, { color: theme.text + '80', marginBottom: 4 }]}>
                Minh họa: <Text style={{ color: theme.text }}>{novel.artist}</Text>
              </Text>
              <Text style={[tw.textSm, { color: theme.text + '80' }]}>
                Tình trạng: <Text style={{ color: theme.text }}>{novel.status}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[tw.flexRow, tw.justifyBetween, tw.mT6]}>
          <ActionButton 
            icon={isFavorite ? 'heart' : 'heart-outline'} 
            label="Ưa thích" 
            onPress={handleFavoriteToggle}
            theme={theme}
          />
          <ActionButton 
            icon="star-outline" 
            label="Đánh giá"
            theme={theme}
          />
          <ActionButton 
            icon="chatbubble-outline" 
            label="Bình luận" 
            onPress={() => setIsCommentsVisible(true)}
            theme={theme}
          />
          <ActionButton 
            icon="share-social-outline" 
            label="Chia sẻ" 
            onPress={() => setIsShareModalVisible(true)}
            theme={theme}
          />
        </View>
      </View>

      {/* Chapters List */}
      <View style={[tw.p6]}>
        <Text style={[tw.text2xl, tw.fontBold, { color: theme.text, marginBottom: 16 }]}>
          Danh sách chương
        </Text>
        <FlatList
          data={volumes}
          renderItem={({ item }) => (
            <VolumeItem
              item={item}
              expandedVolume={expandedVolume}
              theme={theme}
              onToggle={handleVolumeToggle}
              onChapterPress={handleChapterPress}
            />
          )}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Modals */}
      <CommentsModal 
        visible={isCommentsVisible} 
        onClose={() => setIsCommentsVisible(false)} 
      />
      <ShareModal 
        visible={isShareModalVisible} 
        onClose={() => setIsShareModalVisible(false)} 
        novel={novel} 
      />
    </ScrollView>
  );
};

export default NovelDetailScreen;