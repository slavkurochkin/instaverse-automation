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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StoriesList from './components/StoriesList';
import LoginScreen from './components/LoginScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute, RouteProp} from '@react-navigation/native';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Login: undefined;
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

const ProfileScreen = () => {
  return <StoriesList />;
};

// Main tabs screen
const MainTabsScreen = ({navigation}: {navigation: NavigationProp}) => {
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Logout"
          onPress={async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Home');
          }}
        />
      ),
    });
  }, [navigation]);

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
        <Button title="Login" onPress={() => navigation.navigate('Login')} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
