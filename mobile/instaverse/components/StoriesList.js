import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

const StoriesList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5001/stories';

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(API_URL);
        setStories(response.data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={stories}
      keyExtractor={item => item._id.toString()}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
          {item.image && item.image.startsWith('data:image') && (
            <Image source={{uri: item.image}} style={styles.image} />
          )}
          <Text style={styles.footer}>
            Likes: {item.likes.length} | Category: {item.category}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    marginVertical: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  footer: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
});

export default StoriesList;
