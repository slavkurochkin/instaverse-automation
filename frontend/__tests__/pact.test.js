// __tests__/pact.test.js
const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const axios = require('axios');

const { like, eachLike } = MatchersV3;

const provider = new PactV3({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'WebConsumer',
  provider: 'InstaverseAPI',
});

// Adjust the function to use a dynamic baseURL during testing
const getUserProfiles = async (baseURL) => {
  const api = axios.create({ baseURL });
  const response = await api.get('/profile/users');
  return response.data;
};

const EXPECTED_BODY = {
  _id: '1',
  username: 'Admin User',
  role: 'admin',
  age: 37,
  gender: 'male',
  bio: 'Hello, my name is Slav, and I like photography',
  favorite_style: 'outdoor',
  totalPosts: 1,
  email: 'admin@gmail.com',
  password: '$2a$12$6GVrudvnEIl8YOZglieh.Odlguv1eOYYY6eLqkc3MQyKYa1z1mBNu',
};

describe('Instaverse API', () => {
  describe('When a GET request is made to /profile/users', () => {
    test('it should return a profile', async () => {
      await provider.addInteraction({
        state: 'user profiles exist',
        uponReceiving: 'a request to get user profiles',
        withRequest: {
          method: 'GET',
          path: '/profile/users',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: [EXPECTED_BODY], // Use plain values for response
        },
      });

      await provider.executeTest(async (mockProvider) => {
        const profiles = await getUserProfiles(mockProvider.url);
        expect(Array.isArray(profiles)).toBe(true);
        expect(profiles[0]).toEqual(EXPECTED_BODY); // Use `.toEqual()` instead of `.toMatchObject()`
      });
    });
  });
});
