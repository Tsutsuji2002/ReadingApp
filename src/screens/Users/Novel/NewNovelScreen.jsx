import React, { useState, useContext, useEffect, memo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../../context/ThemeContext';
import { useResponsiveContext } from '../../../context/ResponsiveContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { NewNovelCard } from '../../../components/Novel/NewNovelCard';
import { useNavigation } from '@react-navigation/native';
import { fetchNovels } from '../../../redux/reducers/novelSlice';
import { collection, getDocs } from '@firebase/firestore';
import { db } from '../../../../firebaseConfig';

// Memoized Search Header Component
const SearchHeader = memo(({ 
  theme, 
  searchQuery, 
  setSearchQuery, 
  genres, 
  selectedGenre, 
  setSelectedGenre 
}) => {
  const renderGenreChip = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedGenre(item)}
      style={[
        tw.mR2,
        tw.mB2,
        tw.pX3,
        tw.pY2,
        tw.rounded,
        {
          backgroundColor: selectedGenre === item ? theme.screens : theme.comp,
        }
      ]}
    >
      <Text
        style={[
          tw.textSm,
          {
            color: selectedGenre === item ? theme.buttons : theme.text,
          }
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw.p4}>
      <View style={[
        tw.flexRow,
        tw.itemsCenter,
        tw.p2,
        tw.rounded,
        { backgroundColor: theme.comp }
      ]}>
        <Icon name="search-outline" size={20} color={theme.text} style={tw.mR2} />
        <TextInput
          placeholder="Tìm kiếm truyện mới..."
          placeholderTextColor={theme.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            tw.flex1,
            { color: theme.text }
          ]}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={genres}
        renderItem={renderGenreChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tw.mT4}
        keyExtractor={item => item}
      />
    </View>
  );
});

const NewNovelScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { width } = useResponsiveContext();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genres, setGenres] = useState(['All']);
  const [filteredNovels, setFilteredNovels] = useState([]);

  const { novels, isLoading } = useSelector(state => state.novels);

  const fetchGenres = async () => {
    try {
      const genresCollectionRef = collection(db, 'genres');
      const genresSnapshot = await getDocs(genresCollectionRef);
      const genresList = genresSnapshot.docs.map(doc => doc.id);
      setGenres(['All', ...genresList]);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const filterNovels = () => {
    let filtered = novels;

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(novel =>
        novel.genres.includes(selectedGenre)
      );
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(novel =>
        novel.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNovels(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNovels());
    setRefreshing(false);
  };

  useEffect(() => {
    dispatch(fetchNovels());
  }, [dispatch]);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    filterNovels();
  }, [selectedGenre, searchQuery, novels]);

  const screenPadding = 16;
  const cardGap = 10;
  const calculatedWidth = (width - (screenPadding * 2) - cardGap) / 2;

  const renderNovel = ({ item }) => (
    <View style={{ marginHorizontal: cardGap / 2 }}>
      <NewNovelCard
        book={item}
        customWidth={calculatedWidth - cardGap}
        onPress={() => {
          navigation.navigate('NovelDetail', { novel: item });
        }}
      />
    </View>
  );

  return (
    <View style={[tw.flex1, { backgroundColor: theme.screens }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primaryColor} />
      ) : (
        <FlatList
          data={filteredNovels}
          renderItem={renderNovel}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={
            <SearchHeader
              theme={theme}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              genres={genres}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: screenPadding - (cardGap),
            paddingVertical: 8,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.screens]}
              tintColor={theme.screens}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NewNovelScreen;