import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const NovelList = ({ navigation }) => {
  const [novels, setNovels] = useState([]);

  useEffect(() => {
    // Fetch novels from API
  }, []);

  const renderNovel = ({ item }) => (
    <TouchableOpacity 
      style={[tw.p2, tw.borderB, tw.borderGray300]} 
      onPress={() => navigation.navigate('EditNovel', { novel: item })}
    >
      <Text style={[tw.fontBold]}>{item.title}</Text>
      <Text>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[tw.flex1]}>
      <FlatList
        data={novels}
        renderItem={renderNovel}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default NovelList;