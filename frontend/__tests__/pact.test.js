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

const EXPECTED_BODY = eachLike({
  _id: like('1'),
  username: like('Admin User'),
  role: like('admin'),
  age: like(37), // Using `like` to avoid strict type matching
  gender: like('male'),
  bio: like('Hello, my name is Slav, and I like photography'),
  favorite_style: like('outdoor'),
  totalPosts: like(1),
  email: like('admin@gmail.com'),
});

describe('Instaverse API', () => {
  describe('When a GET request is made to /profile/users', () => {
    test('it should return a profile with flexible matching', async () => {
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
          body: EXPECTED_BODY, // Using flexible matchers
        },
      });

      await provider.executeTest(async (mockProvider) => {
        const profiles = await getUserProfiles(mockProvider.url);
        expect(Array.isArray(profiles)).toBe(true);
        expect(profiles[0]).toMatchObject({
          _id: expect.any(String),
          username: expect.any(String),
          role: expect.any(String),
          age: expect.any(Number),
          gender: expect.any(String),
          bio: expect.any(String),
          favorite_style: expect.any(String),
          totalPosts: expect.any(Number),
          email: expect.any(String),
        });
      });
    });
  });
});
