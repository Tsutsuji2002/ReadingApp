import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { tw } from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../../context/ThemeContext';
import { useResponsiveContext } from '../../../context/ResponsiveContext';
import { useAuth } from '../../../context/AuthContext';
import { fetchFavoriteNovels } from '../../../redux/reducers/novelSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('vi-VN');
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleDateString('vi-VN');
  }
  
  return 'N/A';
};

const NovelCard = React.memo(({ item }) => {
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const handleContinueReading = () => {
    if (!item.readingProgress?.chapterId) {
      navigation.navigate('ChapterScreen', {
        novelId: item.novelId,
        volumeId: item.firstVolumeId,
        chapterId: item.firstChapterId,
        chapter: item.firstChapterData
      });
    } else {
      navigation.navigate('ChapterScreen', {
        novelId: item.novelId,
        volumeId: item.readingProgress.volumeId,
        chapterId: item.readingProgress.chapterId,
        lastPosition: item.readingProgress.lastPosition
      });
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        tw.m2,
        tw.rounded,
        tw.p4,
        {
          backgroundColor: theme.extracomp,
          width: width > 768 ? '45%' : '90%'
        }
      ]}
    >
      <View style={tw.flexRow}>
        <View style={[tw.rounded, { width: 120, height: 180, backgroundColor: theme.comp }]}>
          <Image
            source={item.coverImage ? { uri: item.coverImage } : { uri: 'https://via.placeholder.com/300x450' }}
            style={[tw.rounded, { width: 120, height: 180 }]}
            resizeMode="cover"
            defaultSource={{ uri: 'https://via.placeholder.com/300x450' }}
            onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
          />
        </View>
        <View style={[tw.mL4, tw.flex1]}>
          <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={[tw.textSm, tw.mT2, { color: theme.text }]}>
            Tác giả: {item.author || 'Unknown'}
          </Text>
          <Text style={[tw.textSm, tw.mT2, { color: theme.text }]}>
            Thể loại: {item.category || 'N/A'}
          </Text>
          <Text style={[tw.textSm, tw.mT2, { color: theme.text }]}>
            Đọc gần đây: {formatDate(item.readingProgress?.updated_at)}
          </Text>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mT2]}>
            <Icon name="star" size={16} color={theme.extrabutton} />
            <Text style={[tw.mL1, { color: theme.text }]}>{item.rating || 'N/A'}</Text>
          </View>
          <TouchableOpacity 
            style={[
              tw.mT4,
              tw.rounded,
              tw.p2,
              { backgroundColor: theme.buttons }
            ]}
            onPress={handleContinueReading}
          >
            <Text style={[tw.textCenter, { color: theme.buttonstext }]}>
              Tiếp Tục Đọc
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const EmptyFavoriteList = React.memo(({ theme }) => (
  <View style={[tw.flex1, tw.itemsCenter, tw.justifyCenter, tw.p4]}>
    <Icon name="heart-outline" size={64} color={theme.text} />
    <Text style={[tw.textLg, tw.mT4, tw.textCenter, { color: theme.text }]}>
      Bạn chưa có truyện yêu thích nào
    </Text>
    <Text style={[tw.textSm, tw.mT2, tw.textCenter, { color: theme.text }]}>
      Hãy thêm truyện vào danh sách yêu thích để đọc sau
    </Text>
  </View>
));

const MyFavoriteScreen = () => {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  
  const { favoriteNovels = [], isLoading } = useSelector(state => state.novels);
  
  useEffect(() => {
    if (user) {
      console.log('User object:', user);
      if (user.uid) {
        console.log('Dispatching fetchFavoriteNovels for user:', user.uid);
        dispatch(fetchFavoriteNovels(user.uid));
      } else {
        console.log('User is available, but uid is missing:', user);
      }
    } else {
      console.log('User not available');
    }
  }, [user, dispatch]);

  const keyExtractor = React.useCallback((item) => {
  
    return item.novelId || // From your Firestore data
           item.id || // Fallback to id if present
           `${item.title}-${item.author}` || // Create a composite key
           Math.random().toString(); // Last resort - not recommended for production
  }, []);

  const renderItem = React.useCallback(({ item }) => (
    <NovelCard item={item} />
  ), []);

  if (isLoading) {
    return (
      <View style={[tw.flex1, tw.itemsCenter, tw.justifyCenter, { backgroundColor: theme.screens }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[tw.flex1, { backgroundColor: theme.screens }]}>
      <View style={[tw.p4, { backgroundColor: theme.extracomp }]}>
        <Text style={[tw.text2xl, tw.fontBold, { color: theme.text }]}>
          Truyện Yêu Thích
        </Text>
      </View>
      
      {favoriteNovels.length > 0 ? (
        <FlatList
          style={tw.mL4}
          data={favoriteNovels}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={tw.p2}
          numColumns={width > 768 ? 2 : 1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          key={width > 768 ? 'grid' : 'list'} // Force re-render when layout changes
          getItemLayout={(data, index) => ({
            length: 200, // Approximate height of each item
            offset: 200 * index,
            index,
          })}
        />
      ) : (
        <EmptyFavoriteList theme={theme} />
      )}
    </View>
  );
};

export default MyFavoriteScreen;