import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, createComment, createReply, clearComments } from '../redux/reducers/commentsSlice';
import { ThemeContext } from '../context/ThemeContext';
import { auth } from '../../firebaseConfig';
import CommentItem from '../components/Novel/CommentItem';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const ChapterCommentsModal = ({ isVisible, onClose, novelId, volumeId, chapterId }) => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { comments, isLoading, error } = useSelector(state => state.comments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(10);

  useEffect(() => {
    if (isVisible && novelId && volumeId && chapterId) {
      dispatch(fetchComments(chapterId));
    }
    return () => {
      dispatch(clearComments());
    };
  }, [isVisible, novelId, volumeId, chapterId, dispatch]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !auth.currentUser) return;

    if (replyingTo) {
      await dispatch(createReply({
        chapterId,
        parentCommentId: replyingTo,
        replyData: { content: newComment }
      }));
      setReplyingTo(null);
    } else {
      await dispatch(createComment({
        novelId,
        volumeId,
        chapterId,
        content: newComment
      }));
    }
    setNewComment('');
  };

  const handleLoadMore = () => {
    setVisibleCommentsCount(prev => prev + 10);
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setNewComment('');
  };

  const handleLoginPress = () => {
    onClose();
    navigation.navigate('Login');
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[tw.flex1, { backgroundColor: theme.background }]}
      >
        <View style={[tw.flexRow, tw.p4, tw.itemsCenter, tw.justifyBetween, { backgroundColor: theme.comp }]}>
          <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>
            Bình luận {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator style={tw.m4} color={theme.primaryColor} />
        ) : (
          <ScrollView style={tw.flex1} contentContainerStyle={tw.p4}>
            {error && (
              <Text style={[tw.textRed500, tw.mB4]}>
                Có lỗi xảy ra khi tải bình luận
              </Text>
            )}
            
            {comments.slice(0, visibleCommentsCount).map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onReply={handleReply} 
                chapterId={chapterId} 
                novelId={novelId} 
                volumeId={volumeId} 
              />
            ))}

            {visibleCommentsCount < comments.length && (
              <TouchableOpacity 
                onPress={handleLoadMore} 
                style={[tw.p2, tw.roundedLg, tw.bgGray200, tw.itemsCenter, tw.mT4]}
              >
                <Text style={[tw.textSm, { color: theme.text }]}>
                  Xem thêm bình luận
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        <View style={[tw.p4, tw.bgGray100, tw.borderT, tw.borderGray200]}>
          {auth.currentUser ? (
            <>
              {replyingTo && (
                <Text style={[tw.textSm, tw.mB2, { color: theme.text }]}>
                  Trả lời bình luận {replyingTo}
                </Text>
              )}
              <TextInput
                style={[tw.textSm, tw.p2, tw.roundedLg, tw.bgWhite, tw.mB2, { color: theme.text, borderColor: theme.subtext, borderWidth: 1 }]}
                placeholder="Viết bình luận..."
                placeholderTextColor={theme.subtext}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity 
                onPress={handleSubmitComment}
                style={[tw.p2, tw.roundedLg, tw.bgBlue500, tw.itemsCenter]}
              >
                <Text style={[tw.textSm, { color: '#fff' }]}>
                  Gửi bình luận
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleLoginPress} style={[tw.p2, tw.bgBlue500, tw.roundedLg, tw.itemsCenter]}>
              <Text style={[tw.textSm, { color: '#fff' }]}>
                Đăng nhập để bình luận
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChapterCommentsModal;
