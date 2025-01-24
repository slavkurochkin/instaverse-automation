import {
  getProfile,
  getUserProfile,
  getAllProfiles,
} from "../../controllers/profile";
// import profiles from "../../data/users.json" with { type: "json" };
import { readFileSync } from "fs";
const profiles = JSON.parse(
  readFileSync(new URL("../../data/users.json", import.meta.url))
);
import httpMocks from "node-mocks-http";

import { jest } from "@jest/globals";

describe("Profile Controllers", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  describe("getProfile", () => {
    it("should return the profile for the given userId", async () => {
      req.userId = profiles[0]._id;
      await getProfile(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(profiles[0]);
    });

    it("should return 404 if profile not found", async () => {
      req.userId = "nonexistentId";
      await getProfile(req, res);
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty("message");
    });
  });

  describe("getUserProfile", () => {
    it("should return the user profile without password", async () => {
      req.params.userId = profiles[0]._id;
      await getUserProfile(req, res);
      const { password, ...expectedProfile } = profiles[0];
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(expectedProfile);
    });

    it("should return 200 with message if profile not found", async () => {
      req.params.userId = "nonexistentId";
      await getUserProfile(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty("message", "Profile not found");
    });
  });

  describe("getAllProfiles", () => {
    it("should return all profiles without passwords", async () => {
      await getAllProfiles(req, res);
      const expectedProfiles = profiles.map(
        ({ password, ...profile }) => profile
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(expectedProfiles);
    });

    it.skip("should return 404 if an error occurs", async () => {
      // Simulate an error by overriding the map method
      jest.spyOn(profiles, "map").mockImplementation(() => {
        throw new Error("Test error");
      });

      await getAllProfiles(req, res);

      // Check if the status code and error message are correct
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty("message", "Test error");

      // Restore the original behavior after the test
      jest.restoreAllMocks();
    });
  });
});
