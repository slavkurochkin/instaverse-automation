import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  SafeAreaView,
  Text,
  Button,
  ActivityIndicator,
  TextInput,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StoriesList from './components/StoriesList';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute, RouteProp} from '@react-navigation/native';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  NewPost: undefined;
};

type TabParamList = {
  Feed: undefined;
  NewPost: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Create Tab Navigator
const Tab = createBottomTabNavigator<TabParamList>();

// Placeholder for New Post screen
const NewPostScreen = () => {
  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>New Post Form (Coming Soon)</Text>
    </SafeAreaView>
  );
};

// Wrapper components for screens that need search query
const FeedScreen = () => {
  return <StoriesList />;
};

function ProfileScreen({navigation}: {navigation: NavigationProp}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token from storage:', token);
        if (!token) {
          console.log('No token found');
          return;
        }

        // Extract user ID from token
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        console.log('Decoded token payload:', decodedPayload);
        if (decodedPayload.id) {
          const id = decodedPayload.id.toString();
          console.log('Setting user ID from token:', id);
          setUserId(id);

          // Fetch user profile data
          const response = await fetch(
            `http://127.0.0.1:5001/profile/users/${id}`,
          );
          const data = await response.json();
          console.log('Profile data:', data);
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      // Navigate to Home screen after logout
      navigation.replace('Home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  console.log('ProfileScreen userId:', userId);

  return (
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      {profileData ? (
        <View style={{padding: 16}}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor:
                    profileData.gender === 'male'
                      ? 'rgb(0, 135, 251)'
                      : '#FF00FF',
                },
              ]}>
              <Icon
                name={
                  profileData.gender === 'male'
                    ? 'account-tie'
                    : 'account-heart'
                }
                size={50}
                color="white"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{profileData.username}</Text>
              <Text style={styles.bio}>{profileData.bio}</Text>
              <Text style={styles.stats}>
                Total Posts: {profileData.total_posts}
              </Text>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}>
                <Icon name="logout" size={16} color="#FF3B30" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <StoriesList userId={userId} />
        </View>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading profile...</Text>
        </View>
      )}
    </View>
  );
}

// Main tabs screen
const MainTabsScreen = ({navigation}: {navigation: NavigationProp}) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'rgb(0, 135, 251)',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: 'rgb(0, 135, 251)',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: '',
        headerLeft: () => null,
      }}>
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="NewPost"
        component={NewPostScreen}
        options={{
          title: 'New Post',
          headerTitle: 'New Post',
          tabBarIcon: ({color, size}) => (
            <Icon name="plus-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Home screen (shown when not logged in)
const HomeScreen = ({navigation}: {navigation: NavigationProp}) => {
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            style={[styles.headerButton, {marginRight: 10}]}>
            <Text style={styles.headerButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StoriesList />
    </SafeAreaView>
  );
};

// Create Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#f4511e" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'MainTabs' : 'Home'}
        screenOptions={{
          headerStyle: {
            backgroundColor: 'rgb(0, 135, 251)',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => null,
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Instaverse',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabsScreen}
          options={{
            title: 'Instaverse',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            title: 'Sign Up',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: '#888',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#FF3B30',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default App;
