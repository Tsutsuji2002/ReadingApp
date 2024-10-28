import React, { useState, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet
} from 'react-native';
import { tw } from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../context/ThemeContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75;
const MODAL_WIDTH = SCREEN_WIDTH * 0.92;

const CommentsModal = ({ visible, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const [comment, setComment] = useState('');
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  // Sample comments data with online placeholder avatars
  const comments = [
    {
      id: 1,
      user: {
        name: 'NguyenVanA',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      content: 'Chương này hay quá!.',
      timestamp: '1 ngày trước',
      likes: 15,
      replies: [
        {
          id: 2,
          user: {
            name: 'TranThiB',
            avatar: 'https://i.pravatar.cc/150?img=2'
          },
          content: 'Đồng ý! Nhân vật chính càng lúc càng mạnh.',
          timestamp: '10 giờ trước',
          likes: 8,
          replies: [
            {
              id: 3,
              user: {
                name: 'LeVanC',
                avatar: 'https://i.pravatar.cc/150?img=3'
              },
              content: 'Không chỉ mạnh mà còn rất thông minh nữa!',
              timestamp: '30 phút trước',
              likes: 4,
            }
          ]
        }
      ]
    },
    {
      id: 4,
      user: {
        name: 'PhamVanD',
        avatar: 'https://i.pravatar.cc/150?img=4'
      },
      content: 'Truyện như ...',
      timestamp: '3 giờ trước',
      likes: 12,
    },
    {
        id: 5,
        user: {
          name: 'PhamVanD',
          avatar: 'https://i.pravatar.cc/150?img=4'
        },
        content: 'Cốt truyện rất hấp dẫn, mong tác giả ra chương mới sớm.',
        timestamp: '3 giờ trước',
        likes: 12,
    },
    {
        id: 6,
        user: {
          name: 'PhamVanD',
          avatar: 'https://i.pravatar.cc/150?img=4'
        },
        content: 'Cốt truyện rất hấp dẫn, mong tác giả ra chương mới sớm.',
        timestamp: '3 giờ trước',
        likes: 12,
    }
  ];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        if (gestureState.dy > 50) {
          onClose();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  const CommentItem = ({ comment, level = 0 }) => (
    <View style={[tw.mB4, { marginLeft: level * 16 }]}>
      <View style={[tw.flexRow, tw.itemsCenter]}>
        <Image 
          source={{ uri: comment.user.avatar }}
          style={[tw.w8, tw.h8, tw.roundedFull]}
          defaultSource={{ uri: 'https://placehold.co/32x32/png?text=...' }}
        />
        <View style={[tw.mL2, tw.pB2, tw.flex1]}>
          <Text style={[tw.fontBold, { color: theme.text }]}>{comment.user.name}</Text>
          <Text style={[tw.textSm, { color: theme.text }]}>{comment.content}</Text>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mT2]}>
            <Text style={[tw.textXs, { color: theme.text + '80' }]}>{comment.timestamp}</Text>
            <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mL4]}>
              <Icon name="heart-outline" size={16} color={theme.text + '80'} />
              <Text style={[tw.textXs, tw.mL1, { color: theme.text + '80' }]}>{comment.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[tw.mL4]}>
              <Text style={[tw.textXs, { color: theme.text + '80' }]}>Trả lời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} level={level + 1} />
      ))}
    </View>
  );

  const handleImageError = (e) => {
    const fallbackImage = 'https://placehold.co/32x32/png?text=User';
    if (e.nativeEvent.source.uri !== fallbackImage) {
      e.nativeEvent.source.uri = fallbackImage;
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    modalContainer: {
      height: MODAL_HEIGHT,
      width: MODAL_WIDTH,
      backgroundColor: theme.screens,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginBottom: 20, // Add some bottom margin
      overflow: 'hidden', // Ensure content doesn't overflow rounded corners
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dragIndicator: {
      width: 40,
      height: 4,
      backgroundColor: theme.text + '40',
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8
    }
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: pan.y }]
            }
          ]}
        >
          <View style={styles.dragIndicator} />

          <View style={[tw.pX4, tw.flexRow, tw.justifyBetween, tw.itemsCenter]}>
            <Text style={[tw.text2xl, tw.fontBold, { color: theme.text }]}>Bình luận</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={[tw.p2, tw.roundedFull, { backgroundColor: theme.extracomp + '20' }]}
            >
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={[tw.flex1, tw.pX4, tw.mT2]}
            showsVerticalScrollIndicator={false}
          >
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[tw.p4]}
          >
            <View 
              style={[
                tw.flexRow,
                tw.itemsCenter,
                tw.p2,
                tw.roundedL,
                { backgroundColor: theme.extracomp }
              ]}
            >
              <TouchableOpacity 
                style={[tw.p2, tw.roundedFull, { backgroundColor: theme.extracomp + '30' }]}
              >
                <Icon name="image-outline" size={24} color={theme.text} />
              </TouchableOpacity>
              <TextInput
                style={[
                  tw.flex1,
                  tw.mX2,
                  tw.p2,
                  { color: theme.text }
                ]}
                placeholder="Viết bình luận..."
                placeholderTextColor={theme.text + '60'}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity 
                style={[
                  tw.p2,
                  tw.roundedFull,
                  { backgroundColor: theme.buttons }
                ]}
                disabled={!comment.trim()}
                opacity={comment.trim() ? 1 : 0.5}
              >
                <Icon name="send" size={20} color={theme.buttonstext} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CommentsModal;