import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { auth } from '../../../firebaseConfig';

const CommentItem = ({ comment, onReply, chapterId, novelId, volumeId }) => {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [showFullComment, setShowFullComment] = useState(false);
  const currentUserId = auth.currentUser?.uid;  
  const isLiked = comment.likedBy?.includes(currentUserId);

  const handleLike = () => {
    if (!currentUserId) return;
    dispatch(likeComment({
      novelId,
      volumeId,
      chapterId,
      commentId: comment.id,
      isReply: false
    }));
  };

  const handleReplyLike = (replyId) => {
    if (!currentUserId) return;
    dispatch(likeComment({
      novelId,
      volumeId,
      chapterId,
      commentId: replyId,
      isReply: true,
      parentCommentId: comment.id
    }));
  };

  const commentCreatedAt = comment.createdAt?.seconds 
    ? new Date(comment.createdAt.seconds * 1000) 
    : null;

  return (
    <View style={[tw.mB4, tw.p3, { backgroundColor: theme.comp }, tw.roundedLg]}>
      <View style={[tw.flexRow, tw.itemsCenter]}>
        <Image 
          source={{ uri: comment.avatar || 'https://via.placeholder.com/40' }} 
          style={[tw.w10, tw.h10, tw.roundedFull, tw.mR2]} 
        />
        <View style={[tw.flex1]}>
          <Text style={[tw.textBase, tw.fontBold, { color: theme.text }]}>
            {comment.userName}
          </Text>
          {commentCreatedAt && (
            <Text style={[tw.textXs, { color: theme.subtext }]}>
              {formatDistanceToNow(commentCreatedAt, { addSuffix: true, locale: vi })}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleLike} style={tw.flexRow}>
          <Icon 
            name={isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={isLiked ? "red" : theme.text} 
          />
          <Text style={[tw.mL1, tw.textSm, { color: theme.text }]}>
            {comment.likes || 0}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={tw.mT2}>
        <Text 
          style={[tw.textSm, { color: theme.text }]} 
          numberOfLines={showFullComment ? undefined : 3}
        >
          {comment.content}
        </Text>
        {comment.content.length > 150 && (
          <TouchableOpacity onPress={() => setShowFullComment(!showFullComment)}>
            <Text style={[tw.textSm, tw.mT1, { color: theme.primaryColor }]}>
              {showFullComment ? 'Ẩn bớt' : 'Xem thêm'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        onPress={() => onReply(comment.id)} 
        style={[tw.mT2, tw.flexRow, tw.itemsCenter]}
      >
        <Icon name="chatbubble-outline" size={18} color={theme.primaryColor} />
        <Text style={[tw.mL2, { color: theme.primaryColor }]}>Trả lời</Text>
      </TouchableOpacity>

      {comment.replies && comment.replies.length > 0 && (
        <View style={[tw.mL8, tw.mT2]}>
          {comment.replies.map((reply) => (
            <View key={reply.id} style={[tw.mT2, tw.p2, { backgroundColor: theme.background }, tw.roundedLg]}>
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <Image 
                  source={{ uri: reply.avatar || 'https://via.placeholder.com/30' }} 
                  style={[tw.w8, tw.h8, tw.roundedFull, tw.mR2]} 
                />
                <View style={tw.flex1}>
                  <Text style={[tw.textSm, tw.fontBold, { color: theme.text }]}>
                    {reply.userName}
                  </Text>
                  {reply.createdAt?.seconds && (
                    <Text style={[tw.textXs, { color: theme.subtext }]}>
                      {formatDistanceToNow(new Date(reply.createdAt.seconds * 1000), { addSuffix: true, locale: vi })}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleReplyLike(reply.id)} style={tw.flexRow}>
                  <Icon 
                    name={reply.likedBy?.includes(currentUserId) ? "heart" : "heart-outline"} 
                    size={16} 
                    color={reply.likedBy?.includes(currentUserId) ? "red" : theme.text} 
                  />
                  <Text style={[tw.mL1, tw.textXs, { color: theme.text }]}>
                    {reply.likes || 0}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[tw.mT1, tw.textSm, { color: theme.text }]}>
                {reply.content}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default CommentItem;
