import mongoose from "mongoose";
import Story from "../models/storyContent.js";
import stories from "../data/stories.json" assert { type: "json" };
import { users } from "./users.js";

const getStories = async (req, res) => {
  try {
    const story = stories;
    res.status(200).json(story);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUserStories = async (req, res) => {
  const { userId } = req.params; // userId should be passed as a string in the URL parameters

  try {
    // Filter stories by comparing the string userId
    const userStories = stories.filter((story) => story.userId === userId);

    // If no stories found for the user, return a 404 status
    if (userStories.length === 0) {
      return res.status(200).json([]);
    }

    // Return the user's stories
    res.status(200).json(userStories);
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ message: error.message });
  }
};

const getStoriesByTag = async (req, res) => {
  let tag = req.query.tagId;
  try {
    let newStories = [];
    stories.forEach(function (value) {
      if (value.tags.includes(tag)) {
        newStories.push(value);
      }
    });

    res.status(200).json(newStories);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getAllTags = async (req, res) => {
  try {
    let tags = [];
    stories.forEach(function (value) {
      for (let i = 0; i < value.tags.length; i++) {
        if (!tags.includes(value.tags[i])) {
          tags.push(value.tags[i]);
        }
      }
    });

    res.status(200).json(tags);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createStory = async (req, res) => {
  const body = req.body;
  let uniqueId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  const newStory = {
    ...body,
    _id: uniqueId,
    likes: [],
    userId: req.userId,
    comments: [],
    postDate: new Date().toISOString(),
  };

  if (newStory.tags !== undefined) {
    const tagArray = newStory.tags.split(",");
    newStory.tags = tagArray;
  }

  newStory.category = newStory.category;
  newStory.device = newStory.device;

  if (newStory.social !== undefined) {
    const socialArray = newStory.social.join(", ");
    newStory.social = socialArray;
  }

  try {
    stories.push(newStory);

    // Increment totalPosts for the user
    const user = users.find((u) => u._id === req.userId);
    if (user) {
      user.totalPosts = (user.totalPosts || 0) + 1;
    }

    res.status(201).json(newStory);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

const updateStory = async (req, res) => {
  const { id: _id } = req.params;

  //const story = req.body;
  const story = stories.find((t) => t._id === _id);

  if (!story) {
    return res.status(404).send("This id doesnt belong to any story");
  }

  //Find index of specific object using findIndex method.
  let objIndex = stories.findIndex((t) => t._id === _id);

  // Log object to Console.
  // console.log("Before update: ", stories[objIndex])

  //Update object's name property.
  stories[objIndex].caption = req.body["caption"];
  stories[objIndex].tags = req.body["tags"];
  stories[objIndex].image = req.body["image"];

  if (
    typeof stories[objIndex].tags === "string" ||
    stories[objIndex].tags instanceof String
  ) {
    const myArray = stories[objIndex].tags.split(",");
    stories[objIndex].tags = myArray;
  }

  // Log object to console again.
  // console.log("After update: ", stories[objIndex])

  const updatedStory = stories[objIndex];

  res.json(updatedStory);
};

const deleteStory = async (req, res) => {
  const { id: _id } = req.params;

  const story = stories.find((t) => t._id === _id);
  let objIndex = stories.findIndex((t) => t._id === _id);

  if (!story) {
    return res.status(404).send("This id doesnt belong to any story");
  }

  // stories.filter(t => t._id.name != _id);
  stories.splice(objIndex, 1);

  res.json({ message: "Story deleted successfully" });
};

const likeStory = async (req, res) => {
  const { id: _id } = req.params;

  if (!req.userId) return res.json({ message: "Unauthenticated User" });

  const story = stories.find((t) => t._id === _id);

  if (!story) {
    return res.status(404).send("This id doesnt belong to any story");
  }

  const index = story.likes.findIndex((id) => id === String(req.userId));
  //Find index of specific object using findIndex method.
  let objIndex = stories.findIndex((t) => t._id === _id);

  if (index === -1) {
    // if user has not liked the story
    stories[objIndex].likes.push(req.userId);
  } else {
    stories[objIndex].likes.splice(index, 1); // 2nd parameter means remove one item only
    // stories[objIndex].likes.filter(t => t._id !== String(req.userId));
  }

  const updatedStory = stories[objIndex];

  res.json(updatedStory);
};

// Adding commentOnStory function
const commentOnStory = async (req, res) => {
  let commentId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  const { id: _id } = req.params; // Extract story ID from params
  const { text } = req.body; // Extract comment data from the request body
  const { username } = req.body; // Extract comment data from the request body

  if (!req.userId) return res.json({ message: "Unauthenticated User" });

  // Find the specific story by ID
  const story = stories.find((t) => t._id === _id);

  if (!story) {
    return res.status(404).send("This ID doesn't belong to any story");
  }

  // Find the index of the story
  let objIndex = stories.findIndex((t) => t._id === _id);

  // Construct the new comment object
  const newComment = {
    commentId,
    text,
    username,
    userId: req.userId,
    commentDate: new Date().toISOString(),
  };

  // If the story doesn't have a comments array, initialize it
  if (!stories[objIndex].comments) {
    stories[objIndex].comments = [];
  }

  // Add the new comment to the story
  stories[objIndex].comments.push(newComment);

  // Return the updated story with the new comment

  const updatedStory = stories[objIndex];

  res.status(201).json(updatedStory);
};

// Adding deleteComment function
const deleteComment = async (req, res) => {
  const { id: _id, commentId } = req.params; // Extract story ID and comment ID from params

  if (!req.userId) return res.json({ message: "Unauthenticated User" });

  // Find the specific story by ID
  const story = stories.find((t) => t._id === _id);

  if (!story) {
    return res.status(404).send("This ID doesn't belong to any story");
  }

  // Find the index of the story
  let storyIndex = stories.findIndex((t) => t._id === _id);

  // Find the comment by commentId
  const commentIndex = stories[storyIndex].comments.findIndex(
    (c) => c.commentId === commentId
  );

  // If the comment doesn't exist, return a 404
  if (commentIndex === -1) {
    return res.status(404).send("This comment ID doesn't exist");
  }

  // Check if the user deleting the comment is the one who posted it
  if (stories[storyIndex].comments[commentIndex].userId !== req.userId) {
    return res
      .status(403)
      .send("You are not authorized to delete this comment");
  }

  // Remove the comment
  stories[storyIndex].comments.splice(commentIndex, 1);

  // Return the updated story
  const updatedStory = stories[storyIndex];

  res.status(200).json(updatedStory);
};

const deleteUserStories = async (req, res) => {
  const { userId } = req.params; // Extract user ID from params

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  // Filter out stories that belong to the user
  const userStories = stories.filter((story) => story.userId === userId);

  if (userStories.length === 0) {
    return res.status(404).json({ message: "No stories found for this user" });
  }

  // Remove the user's stories from the main stories array
  for (let i = stories.length - 1; i >= 0; i--) {
    if (stories[i].userId === userId) {
      stories.splice(i, 1);
    }
  }

  res.status(200).json({
    message: "All stories associated with the user have been deleted",
  });
};

const deleteUserComments = async (req, res) => {
  const { userId } = req.params; // Extract user ID from params

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  let commentsDeleted = 0;
  console.log("userId: ", userId);
  // Iterate over all stories
  stories.forEach((story) => {
    // Filter out comments that belong to the user
    const initialCommentsLength = story.comments.length;
    story.comments = story.comments.filter(
      (comment) => comment.userId !== userId
    );
    commentsDeleted += initialCommentsLength - story.comments.length;
  });

  if (commentsDeleted === 0) {
    return res.status(404).json({ message: "No comments found for this user" });
  }

  res.status(200).json({
    message: `${commentsDeleted} comments associated with the user have been deleted`,
  });
};

export {
  getStories,
  getUserStories,
  createStory,
  updateStory,
  deleteStory,
  likeStory,
  getStoriesByTag,
  getAllTags,
  commentOnStory,
  deleteComment,
  deleteUserStories,
  deleteUserComments,
};
