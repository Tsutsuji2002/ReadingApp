import React, { useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { tw } from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserNovels, deleteUserNovel } from '../../../redux/reducers/novelSlice';

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

const NovelStatus = ({ status, theme }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'hiatus':
        return '#FFC107';
      case 'dropped':
        return '#F44336';
      default:
        return theme.text;
    }
  };

  const getStatusText = () => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return 'Đang Ra';
      case 'completed':
        return 'Hoàn Thành';
      case 'hiatus':
        return 'Tạm Dừng';
      case 'dropped':
        return 'Đã Dừng';
      default:
        return 'N/A';
    }
  };

  return (
    <View style={[
      tw.rounded,
      tw.pX2,
      tw.pY1,
      { backgroundColor: getStatusColor() + '20' }
    ]}>
      <Text style={[
        tw.textXs,
        { color: getStatusColor() }
      ]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const NovelCard = React.memo(({ item, onEdit, onDelete, theme, width }) => {
  const navigation = useNavigation();

  const handleViewNovel = () => {
    navigation.navigate('NovelDetail', { novel: item });
  };

  const handleManageChapters = () => {
    navigation.navigate('ManageChapters', { 
      novelData: item,
      novelId: item.novelId,
      title: item.title
    });
  };
  
  return (
    <View 
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
      <TouchableOpacity 
        style={tw.flexRow}
        onPress={handleViewNovel}
      >
        <View style={[tw.rounded, { width: 120, height: 180, backgroundColor: theme.comp }]}>
          <Image
            source={item.cover_url ? { uri: item.cover_url } : require('../../../../assets/placeholder300x450.png')}
            style={[tw.rounded, { width: 120, height: 180 }]}
            resizeMode="cover"
          />
        </View>
        <View style={[tw.mL4, tw.flex1]}>
          <Text 
            style={[tw.textLg, tw.fontBold, { color: theme.text }]}
            numberOfLines={2}
          >
            {item.title || 'Untitled'}
          </Text>
          
          <View style={[tw.flexRow, tw.itemsCenter, tw.mT2]}>
            <NovelStatus status={item.status} theme={theme} />
            <Text style={[tw.mL2, tw.textSm, { color: theme.text }]}>
              {item.total_chapters || 0} chương
            </Text>
          </View>

          <Text style={[tw.textSm, tw.mT2, { color: theme.text }]} numberOfLines={1}>
            Thể loại: {item.genres?.join(', ') || 'N/A'}
          </Text>

          <Text style={[tw.textSm, tw.mT2, { color: theme.text }]}>
            Cập nhật: {formatDate(item.updated_at)}
          </Text>

          <View style={[tw.flexRow, tw.itemsCenter, tw.mT2]}>
            <Icon name="eye" size={16} color={theme.extrabutton} />
            <Text style={[tw.mL1, { color: theme.text }]}>{item.view_count || 0}</Text>
            <Icon name="star" size={16} color={theme.extrabutton} style={tw.mL2} />
            <Text style={[tw.mL1, { color: theme.text }]}>
              {item.rating ? item.rating.toFixed(1) : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={[tw.flexRow, tw.mT4, tw.justifyBetween]}>
        <TouchableOpacity 
          style={[
            tw.rounded,
            tw.p2,
            tw.flex1,
            tw.mR2,
            { backgroundColor: theme.buttons }
          ]}
          onPress={() => handleManageChapters()}
        >
          <Text style={[tw.textCenter, { color: theme.buttonstext }]}>
            Quản Lý Chương
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            tw.rounded,
            tw.p2,
            tw.flex1,
            tw.mR2,
            { backgroundColor: theme.buttons }
          ]}
          onPress={() => onEdit(item)}
        >
          <Text style={[tw.textCenter, { color: theme.buttonstext }]}>
            Chỉnh Sửa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            tw.rounded,
            tw.p2,
            tw.flex1,
            { backgroundColor: '#FF4444' }
          ]}
          onPress={() => onDelete(item)}
        >
          <Text style={[tw.textCenter, { color: '#FFFFFF' }]}>
            Xóa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const EmptyNovelList = React.memo(({ theme }) => (
  <View style={[tw.flex1, tw.itemsCenter, tw.justifyCenter, tw.p4]}>
    <Icon name="book-outline" size={64} color={theme.text} />
    <Text style={[tw.textLg, tw.mT4, tw.textCenter, { color: theme.text }]}>
      Bạn chưa tạo truyện nào
    </Text>
    <Text style={[tw.textSm, tw.mT2, tw.textCenter, { color: theme.text }]}>
      Hãy bắt đầu viết truyện của riêng bạn
    </Text>
  </View>
));

const MyNovelScreen = () => {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  
  const { items: myNovels, isLoading, error } = useSelector(state => state.novels.userNovels);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserNovels());
    }
  }, [user, dispatch]);

  const handleRefresh = () => {
    if (user?.uid) {
      dispatch(fetchUserNovels(user.uid));
    }
  };

  const handleEditNovel = (novel) => {
    navigation.navigate('EditNovel', { novel });
  };

  const handleCreateNovel = () => {
    navigation.navigate('CreateNovel');
  };

  const handleDeleteNovel = (novel) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa truyện "${novel.title}"?\n\nHành động này không thể hoàn tác.`,
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteUserNovel(novel.novelId)).unwrap();
              Alert.alert('Thành công', 'Đã xóa truyện thành công');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa truyện. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };

  const keyExtractor = React.useCallback((item) => {
    return item.novelId || Math.random().toString();
  }, []);

  const renderItem = React.useCallback(({ item }) => (
    <NovelCard 
      item={item} 
      onEdit={handleEditNovel}
      onDelete={handleDeleteNovel}
      theme={theme}
      width={width}
    />
  ), [theme, width]);

  if (error) {
    return (
      <View style={[tw.flex1, tw.itemsCenter, tw.justifyCenter, { backgroundColor: theme.screens }]}>
        <Text style={[tw.textLg, tw.textCenter, tw.p4, { color: theme.text }]}>
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
        </Text>
        <TouchableOpacity 
          style={[tw.mT4, tw.rounded, tw.p2, { backgroundColor: theme.buttons }]}
          onPress={handleRefresh}
        >
          <Text style={[tw.textCenter, { color: theme.buttonstext }]}>
            Thử Lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[tw.flex1, { backgroundColor: theme.screens }]}>
      <View style={[tw.p4, tw.flexRow, tw.justifyBetween, tw.itemsCenter, { backgroundColor: theme.extracomp }]}>
        <Text style={[tw.text2xl, tw.fontBold, { color: theme.text }]}>
          Truyện Của Tôi
        </Text>
        <TouchableOpacity 
          style={[tw.rounded, tw.p2, { backgroundColor: theme.buttons }]}
          onPress={handleCreateNovel}
        >
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <Icon name="add" size={20} color={theme.buttonstext} />
            <Text style={[tw.mL1, { color: theme.buttonstext }]}>
              Tạo Truyện Mới
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {myNovels.length > 0 ? (
        <FlatList
          data={myNovels}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={tw.p2}
          numColumns={width > 768 ? 2 : 1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          key={width > 768 ? 'grid' : 'list'}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[theme.text]}
              tintColor={theme.text}
            />
          }
          ListEmptyComponent={!isLoading && <EmptyNovelList theme={theme} />}
        />
      ) : (
        !isLoading && <EmptyNovelList theme={theme} />
      )}

      {isLoading && (
        <View style={[tw.absolute, tw.inset0, tw.itemsCenter, tw.justifyCenter, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      )}
    </View>
  );
};

export default MyNovelScreen;