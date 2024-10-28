import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Share,
  Alert,
  ToastAndroid,
  Platform
} from 'react-native';
import { tw } from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../context/ThemeContext';
import * as Clipboard from 'expo-clipboard';

const ShareModal = ({ visible, onClose, novel }) => {
  const { theme } = useContext(ThemeContext);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', message, [{ text: 'OK', onPress: () => {} }]);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `Check out ${novel.title} on our platform!`;
      await Clipboard.setStringAsync(shareUrl);
      showToast('Link copied to clipboard!');
      onClose();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard');
    }
  };

  const shareOptions = [
    {
      id: 'copy',
      icon: 'copy-outline',
      label: 'Copy Link',
      onPress: handleCopyLink
    },
    {
      id: 'facebook',
      icon: 'logo-facebook',
      label: 'Facebook',
      onPress: async () => {
        try {
          const result = await Share.share({
            message: `Check out ${novel.title} on our platform!`,
            title: novel.title,
          });
          if (result.action === Share.sharedAction) {
            onClose();
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
    {
      id: 'twitter',
      icon: 'logo-twitter',
      label: 'Twitter',
      onPress: async () => {
        try {
          const result = await Share.share({
            message: `Reading ${novel.title} - ${novel.author}`,
            title: novel.title,
          });
          if (result.action === Share.sharedAction) {
            onClose();
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
    {
      id: 'message',
      icon: 'mail-outline',
      label: 'Message',
      onPress: async () => {
        try {
          const result = await Share.share({
            message: `Hey! I thought you might enjoy reading ${novel.title} by ${novel.author}`,
            title: novel.title,
          });
          if (result.action === Share.sharedAction) {
            onClose();
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  ];

  const ShareOption = ({ icon, label, onPress, customStyle, iconColor }) => (
    <TouchableOpacity
      style={[
        tw.p3,
        tw.itemsCenter,
        tw.justifyCenter,
        { flex: 1 },
        customStyle
      ]}
      onPress={onPress}
    >
      <View
        style={[
          tw.roundedFull,
          tw.p4,
          tw.itemsCenter,
          tw.justifyCenter,
          { backgroundColor: customStyle?.backgroundColor || theme.extracomp + '20' }
        ]}
      >
        <Icon name={icon} size={24} color={iconColor || theme.primary} />
      </View>
      <Text style={[tw.textSm, tw.mT2, { color: theme.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[
          tw.flex1,
          tw.justifyEnd,
          { backgroundColor: 'rgba(0,0,0,0.5)' }
        ]}>
          <TouchableWithoutFeedback>
            <View style={[
              tw.p6,
              tw.roundedTLg,
              tw.roundedTLg,
              { backgroundColor: theme.screens }
            ]}>
              <View style={[tw.flexRow, tw.justifyBetween, tw.itemsCenter, tw.mB6]}>
                <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>
                  Chia sẻ với
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    tw.roundedFull,
                    tw.p2,
                    { backgroundColor: theme.extracomp + '20' }
                  ]}
                >
                  <Icon name="close" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={[tw.flexRow, tw.flexWrap, tw.mB4]}>
                {shareOptions.map((option) => (
                  <ShareOption
                    key={option.id}
                    icon={option.icon}
                    label={option.label}
                    onPress={option.onPress}
                    customStyle={ 
                      option.id === 'facebook' ? null : 
                      option.id === 'twitter' ? null : 
                      option.id === 'message' ? null : 
                      null
                    }
                    iconColor={ 
                      option.id === 'facebook' ? '#3b5998' : 
                      option.id === 'twitter' ? '#1DA1F2' : 
                      option.id === 'message' ? '#f44336' :
                      theme.primary
                    }
                  />
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ShareModal;
