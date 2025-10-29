import mongoose from "mongoose";
import Story from "../../models/storyContent.js";
// import stories from "../data/stories.json" with { type: "json" };
import fs from "fs";
const stories = JSON.parse(
  fs.readFileSync(new URL("../../data/stories.json", import.meta.url))
);
import { users } from "./users.js";
import amqp from "amqplib";

// Track notifications sent to prevent duplicates (e.g., when user likes, unlikes, then likes again)
// Key format: `${postId}-${likedBy}`, value: true if notification was sent
const sentNotifications = new Set();

const getStories = async (req, res) => {
  try {
    // Modify image paths to include full URL
    // Ensure we return all fields + the correct image URL

    const updatedStories = stories.map((story) => {
      if (story.image && story.image.startsWith("http://")) {
        return { ...story };
      } else {
        return {
          ...story,
          image: `${req.protocol}://${req.get("host")}/images/${story.image}`,
        };
      }
    });

    res.status(200).json(updatedStories);
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

    // Modify image paths to include full URL (same as getStories function)
    const updatedUserStories = userStories.map((story) => {
      if (story.image && story.image.startsWith("http://")) {
        return { ...story };
      } else {
        return {
          ...story,
          image: `${req.protocol}://${req.get("host")}/images/${story.image}`,
        };
      }
    });

    // Return the user's stories with proper image URLs
    res.status(200).json(updatedUserStories);
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

    // Modify image paths to include full URL (same as getStories function)
    const updatedStories = newStories.map((story) => {
      if (story.image && story.image.startsWith("http://")) {
        return { ...story };
      } else {
        return {
          ...story,
          image: `${req.protocol}://${req.get("host")}/images/${story.image}`,
        };
      }
    });

    res.status(200).json(updatedStories);
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
  try {
    const body = req.body;
    const uniqueId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    let imagePath = null;

    // Handle Base64 image
    if (body.image && body.image.startsWith("data:image")) {
      const matches = body.image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      const ext = matches[1]; // Extract file extension (e.g., png, jpg)
      const base64Data = matches[2]; // Extract Base64 content
      imagePath = `public/images/${uniqueId}.${ext}`;
      fs.writeFileSync(imagePath, Buffer.from(base64Data, "base64"));

      // Convert to accessible URL
      imagePath = `${uniqueId}.${ext}`;
    }

    const newStory = {
      ...body,
      _id: uniqueId,
      likes: [],
      userId: req.userId,
      comments: [],
      postDate: new Date().toISOString(),
      image: imagePath, // Store URL if image was saved
    };

    // Ensure tags are stored as an array
    if (typeof newStory.tags === "string") {
      newStory.tags = newStory.tags.split(",").map((tag) => tag.trim());
    }

    // Ensure social is stored as an array
    if (typeof newStory.social === "string") {
      newStory.social = newStory.social.split(",").map((s) => s.trim());
    }

    // Save story to in-memory database (or actual DB)
    stories.push(newStory);

    // Increment totalPosts for the user
    const user = users.find((u) => u._id === req.userId);
    if (user) {
      user.totalPosts = (user.totalPosts || 0) + 1;
    }

    // Return the newly created story
    // Ensure the image path is a full URL
    newStory.image = `${req.protocol}://${req.get("host")}/images/${imagePath}`;
    // Return the new story with the full image URL

    res.status(201).json(newStory);

    // hack to show image after refresh
    newStory.image = `${imagePath}`;
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: "Failed to create story" });
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

  // Delete the image file if it exists
  if (story.image) {
    const imagePath = `public/images/${story.image}`;
    console.log("Deleting image at path:", imagePath);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(`Failed to delete image file: ${imagePath}`, err);
      } else {
        console.log(`Image file deleted: ${imagePath}`);
      }
    });
  }

  // stories.filter(t => t._id.name != _id);
  stories.splice(objIndex, 1);

  res.json({ message: "Story deleted successfully" });
};

// Function to send notification to RabbitMQ
async function sendNotificationToQueue(notification) {
  let connection = null;
  let channel = null;
  try {
    // Connect to RabbitMQ with a timeout wrapper
    const connectPromise = amqp.connect("amqp://localhost");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error("Connection timeout: RabbitMQ server may not be running")
          ),
        5000
      )
    );

    // Use Promise.race but catch errors properly
    connection = await Promise.race([connectPromise, timeoutPromise]);

    channel = await connection.createChannel();
    await channel.assertQueue("notifications", { durable: true });

    channel.sendToQueue(
      "notifications",
      Buffer.from(JSON.stringify(notification)),
      {
        persistent: true,
      }
    );

    console.log("Sent to queue:", notification);
  } catch (error) {
    // Handle AggregateError (can happen when Promise.race has multiple rejections)
    let errorMessage = "Unknown error";
    if (error instanceof AggregateError) {
      // Extract the first meaningful error from AggregateError
      const firstError = error.errors?.[0];
      errorMessage =
        firstError?.message ||
        firstError?.toString() ||
        error.message ||
        error.toString();
      console.error("AggregateError details:", error.errors);
    } else {
      errorMessage = error?.message || error?.toString() || "Unknown error";
    }

    console.error("Failed to send notification:", errorMessage);

    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("Connection timeout") ||
      errorMessage.includes("ENOTFOUND")
    ) {
      console.warn(
        "⚠️  RabbitMQ appears to be unavailable. Notifications are disabled."
      );
      console.warn(
        "   To enable notifications, start RabbitMQ with: docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:management"
      );
    }

    // Fail silently - notifications are optional functionality
    // The main request should still succeed even if notifications fail
  } finally {
    // Clean up resources
    try {
      if (channel) await channel.close();
    } catch (closeError) {
      // Ignore close errors
    }
    try {
      if (connection) await connection.close();
    } catch (closeError) {
      // Ignore close errors
    }
  }
}

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

  let isLiked = false;

  if (index === -1) {
    // if user has not liked the story
    stories[objIndex].likes.push(req.userId);
    isLiked = true;
  } else {
    stories[objIndex].likes.splice(index, 1); // 2nd parameter means remove one item only
    // stories[objIndex].likes.filter(t => t._id !== String(req.userId));
  }

  const updatedStory = stories[objIndex];

  // Send notification to RabbitMQ if the story was liked (not unliked)
  // Only send notification if this is the FIRST time this user has liked this post
  // (prevents duplicate notifications when user likes, unlikes, then likes again)
  const notificationKey = `${_id}-${req.userId}`;
  const hasSentNotification = sentNotifications.has(notificationKey);

  if (isLiked && story.userId !== req.userId && !hasSentNotification) {
    // Get username of the user who liked the post
    const likedByUser = users.find((u) => u._id === req.userId);
    const likedByUsername = likedByUser ? likedByUser.username : "Someone";

    await sendNotificationToQueue({
      type: "LIKE",
      postId: _id,
      userId: story.userId, // Post owner who will receive the notification
      likedBy: req.userId, // User who liked the post
      username: likedByUsername, // Username of the person who liked
      postTitle: story.caption || "Untitled Post", // Post caption/title
    });

    // Mark that we've sent a notification for this user+post combination
    sentNotifications.add(notificationKey);
  }

  // Update only if not already set to full URL
  if (!updatedStory.image.startsWith("http")) {
    updatedStory.image = `${req.protocol}://${req.get("host")}/images/${updatedStory.image}`;
  }

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

  // Update only if not already set to full URL
  if (!updatedStory.image.startsWith("http")) {
    updatedStory.image = `${req.protocol}://${req.get("host")}/images/${updatedStory.image}`;
  }

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

  // Update only if not already set to full URL
  if (!updatedStory.image.startsWith("http")) {
    updatedStory.image = `${req.protocol}://${req.get("host")}/images/${updatedStory.image}`;
  }

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
      // Delete the image file if it exists
      if (stories[i].image) {
        const imagePath = `public/images/${story.image}`;
        console.log("Deleting image at path:", imagePath);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Failed to delete image file: ${imagePath}`, err);
          } else {
            console.log(`Image file deleted: ${imagePath}`);
          }
        });
      }

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
