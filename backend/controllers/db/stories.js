import pool from "../../db.js";
import amqp from "amqplib";

// Track notifications sent to prevent duplicates (e.g., when user likes, unlikes, then likes again)
// Key format: `${postId}-${likedBy}`, value: true if notification was sent
const sentNotifications = new Set();

export const getStories = async (req, res) => {
  try {
    const query = `
        SELECT json_agg(
          json_build_object(
            '_id', p.id,
            'caption', p.caption,
            'category', p.category,
            'device', p.device,
            'username', u.username,
            'userId', p.user_id,
            'image', p.image,
            'tags', COALESCE((
              SELECT json_agg(t.tag)
              FROM post_tags t
              WHERE t.post_id = p.id
            ), '[]'::json),
            'social', COALESCE((
              SELECT json_agg(s.platform)
              FROM post_social s
              WHERE s.post_id = p.id
            ), '[]'::json),
            'likes', COALESCE((
              SELECT json_agg(l.user_id)
              FROM post_likes l
              WHERE l.post_id = p.id
            ), '[]'::json),
            'postDate', p.post_date,
            'comments', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'commentId', c.id,
                  'text', c.text,
                  'userId', c.user_id,
                  'username', cu.username,
                  'commentDate', c.comment_date
                )
              )
              FROM post_comments c
              JOIN users cu ON c.user_id = cu._id
              WHERE c.post_id = p.id
            ), '[]'::json)
          )
        ) AS stories
        FROM posts p
        JOIN users u ON p.user_id = u._id;
      `;

    const { rows } = await pool.query(query);

    res.json(rows[0].stories || []);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserStories = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
        SELECT json_agg(story ORDER BY story->>'postDate' DESC) AS stories
        FROM (
          SELECT json_build_object(
            '_id', p.id,
            'caption', p.caption,
            'category', p.category,
            'device', p.device,
            'username', u.username,
            'userId', p.user_id,
            'image', p.image,
            'tags', (
              SELECT json_agg(t.tag)
              FROM post_tags pt
              JOIN post_tags t ON pt.id = t.id
              WHERE pt.post_id = p.id
            ),
            'likes', COALESCE((
              SELECT json_agg(l.user_id)
              FROM post_likes l
              WHERE l.post_id = p.id
            ), '[]'::json),
            'postDate', p.post_date,
            'comments', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'commentId', c.id,
                  'text', c.text,
                  'userId', c.user_id,
                  'username', cu.username,
                  'commentDate', c.comment_date
                )
              )
              FROM post_comments c
              JOIN users cu ON c.user_id = cu._id
              WHERE c.post_id = p.id
            ), '[]'::json)
          ) AS story
          FROM posts p
          JOIN users u ON p.user_id = u._id
          WHERE p.user_id = $1
        ) stories;
      `;

    const result = await pool.query(query, [userId]);
    const stories = result.rows[0]?.stories || [];

    // Convert image paths to full URLs (same as no-db version)
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
    res.status(500).json({ message: error.message });
  }
};

export const getStoriesByTag = async (req, res) => {
  const { tagId } = req.query;

  try {
    const result = await pool.query(
      "SELECT p.* FROM posts p JOIN post_tags pt ON p.id = pt.post_id WHERE pt.tag = $1",
      [tagId]
    );

    // Convert image paths to full URLs
    const updatedStories = result.rows.map((story) => {
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
    res.status(500).json({ message: error.message });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT tag FROM post_tags");
    res.status(200).json(result.rows.map((row) => row.tag));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStory = async (req, res) => {
  const { caption, category, device, image, tags, social, username } = req.body;
  const userId = req.body.userId || req.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Insert the new post
    const newPost = await pool.query(
      "INSERT INTO posts (caption, category, device, username, user_id, image, post_date) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [caption, category, device, username, userId, image]
    );

    const postId = newPost.rows[0].id;
    let tagArray = [];
    let socialArray = [];

    // Insert tags correctly
    if (tags) {
      tagArray = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
      for (const tag of tagArray) {
        await pool.query(
          "INSERT INTO post_tags (post_id, tag) VALUES ($1, $2)",
          [postId, tag]
        );
      }
    }

    // Insert social platforms correctly
    if (social) {
      socialArray = Array.isArray(social) ? social : [social];
      for (const platform of socialArray) {
        await pool.query(
          "INSERT INTO post_social (post_id, platform) VALUES ($1, $2)",
          [postId, platform.trim()]
        );
      }
    }

    // **Increment total_posts in users table**
    await pool.query(
      "UPDATE users SET total_posts = total_posts + 1 WHERE _id = $1",
      [userId]
    );

    // Fetch tags and social platforms from the database
    const tagsResult = await pool.query(
      "SELECT tag FROM post_tags WHERE post_id = $1",
      [postId]
    );
    const socialResult = await pool.query(
      "SELECT platform FROM post_social WHERE post_id = $1",
      [postId]
    );

    // Format response to match frontend expectations
    const response = {
      _id: postId,
      caption: newPost.rows[0].caption,
      tags: tagsResult.rows.map((row) => row.tag),
      category: newPost.rows[0].category,
      device: newPost.rows[0].device,
      social: socialResult.rows.map((row) => row.platform),
      image: newPost.rows[0].image,
      username: newPost.rows[0].username,
      userId: newPost.rows[0].user_id,
      likes: [],
      comments: [],
      postDate: newPost.rows[0].post_date,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStory = async (req, res) => {
  const { id } = req.params;
  const { caption, tags, image, social, category, device } = req.body;

  try {
    // Update the post, ensuring category and device are updated
    await pool.query(
      "UPDATE posts SET caption = $1, image = $2, category = $3, device = $4 WHERE id = $5",
      [caption, image, category, device, id]
    );

    let tagArray = [];
    let socialArray = [];

    // Update tags
    if (tags) {
      await pool.query("DELETE FROM post_tags WHERE post_id = $1", [id]);
      tagArray = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
      for (const tag of tagArray) {
        await pool.query(
          "INSERT INTO post_tags (post_id, tag) VALUES ($1, $2)",
          [id, tag]
        );
      }
    }

    // Update social platforms
    if (social) {
      await pool.query("DELETE FROM post_social WHERE post_id = $1", [id]);
      socialArray = Array.isArray(social) ? social : [social];
      for (const platform of socialArray) {
        await pool.query(
          "INSERT INTO post_social (post_id, platform) VALUES ($1, $2)",
          [id, platform]
        );
      }
    }

    // Fetch the updated post details
    const updatedPost = await pool.query(
      "SELECT * FROM posts WHERE post_id = $1",
      [id]
    );
    if (updatedPost.rows.length === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Fetch updated tags
    const tagsResult = await pool.query(
      "SELECT tag FROM post_tags WHERE post_id = $1",
      [id]
    );

    // Fetch updated social platforms
    const socialResult = await pool.query(
      "SELECT platform FROM post_social WHERE post_id = $1",
      [id]
    );

    // Format response to match frontend expectations
    const response = {
      _id: updatedPost.rows[0].id, // Use `_id` instead of `id`
      caption: updatedPost.rows[0].caption,
      tags: tagsResult.rows.map((row) => row.tag), // Return tags as an array
      category: updatedPost.rows[0].category, // Now properly updated
      device: updatedPost.rows[0].device, // Now properly updated
      social: socialResult.rows.map((row) => row.platform), // Return social as an array
      image: updatedPost.rows[0].image,
      username: updatedPost.rows[0].username,
      userId: updatedPost.rows[0].user_id,
      likes: [], // Assuming no changes to likes
      comments: [], // Assuming no changes to comments
      postDate: updatedPost.rows[0].post_date,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStory = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("BEGIN"); // Start transaction

    // Delete related likes
    await pool.query("DELETE FROM post_likes WHERE post_id = $1", [id]);

    // Delete related comments
    await pool.query("DELETE FROM post_comments WHERE post_id = $1", [id]);

    // Delete related tags (if applicable)
    await pool.query("DELETE FROM post_tags WHERE post_id = $1", [id]);

    // Delete related shares (if applicable)
    await pool.query("DELETE FROM post_social WHERE post_id = $1", [id]);

    // Finally, delete the post itself
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    await pool.query("COMMIT"); // Commit transaction

    res.json({ message: "Story and all related data deleted successfully" });
  } catch (error) {
    await pool.query("ROLLBACK"); // Rollback in case of an error
    res.status(500).json({ message: error.message });
  }
};

export const likeStory = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Check if user already liked the post
    const existingLike = await pool.query(
      "SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2",
      [id, userId]
    );

    let isLiked = false;

    if (existingLike.rows.length === 0) {
      await pool.query(
        "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)",
        [id, userId]
      );
      isLiked = true;
    } else {
      await pool.query(
        "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2",
        [id, userId]
      );
    }

    // Fetch updated post details
    const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [
      id,
    ]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    const postOwnerId = postResult.rows[0].user_id;
    const postCaption = postResult.rows[0].caption;

    // Fetch username of the user who liked the post
    const likedByUserResult = await pool.query(
      "SELECT username FROM users WHERE _id = $1",
      [userId]
    );
    const likedByUsername = likedByUserResult.rows[0]?.username || "Someone";

    // Send notification to RabbitMQ if the story was liked (not unliked)
    // Only send notification if this is the FIRST time this user has liked this post
    // (prevents duplicate notifications when user likes, unlikes, then likes again)
    const notificationKey = `${id}-${userId}`;
    const hasSentNotification = sentNotifications.has(notificationKey);

    if (isLiked && postOwnerId !== userId && !hasSentNotification) {
      await sendNotificationToQueue({
        type: "LIKE",
        postId: id,
        userId: postOwnerId, // Post owner who will receive the notification
        likedBy: userId, // User who liked the post
        username: likedByUsername, // Username of the person who liked
        postTitle: postCaption || "Untitled Post", // Post caption/title
      });

      // Mark that we've sent a notification for this user+post combination
      sentNotifications.add(notificationKey);
    }

    // Fetch updated likes
    const likesResult = await pool.query(
      "SELECT user_id FROM post_likes WHERE post_id = $1",
      [id]
    );

    // Fetch tags
    const tagsResult = await pool.query(
      "SELECT tag FROM post_tags WHERE post_id = $1",
      [id]
    );

    // Fetch social platforms
    const socialResult = await pool.query(
      "SELECT platform FROM post_social WHERE post_id = $1",
      [id]
    );

    // Fetch comments
    const commentsResult = await pool.query(
      `SELECT c.id AS commentId, c.text, c.user_id AS userId, u.username, 
                c.comment_date AS commentDate, c.seen_by_story_owner AS seenByStoryOwner
         FROM post_comments c
         JOIN users u ON c.user_id = u._id
         WHERE c.post_id = $1
         ORDER BY c.comment_date ASC`,
      [id]
    );

    // Format response to match expected structure
    const response = {
      _id: postResult.rows[0].id,
      caption: postResult.rows[0].caption,
      category: postResult.rows[0].category,
      device: postResult.rows[0].device,
      social: socialResult.rows.map((row) => row.platform),
      username: postResult.rows[0].username,
      userId: postResult.rows[0].user_id,
      image: postResult.rows[0].image,
      tags: tagsResult.rows.map((row) => row.tag),
      likes: likesResult.rows.map((row) => row.user_id), // List of user IDs who liked the post
      postDate: postResult.rows[0].post_date,
      comments: commentsResult.rows.map((row) => ({
        commentId: row.commentid,
        text: row.text,
        userId: row.userid,
        username: row.username,
        commentDate: row.commentdate,
        seenByStoryOwner: row.seenbystoryowner,
      })),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to send notification to RabbitMQ
async function sendNotificationToQueue(notification) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("notifications", { durable: true });

    channel.sendToQueue(
      "notifications",
      Buffer.from(JSON.stringify(notification)),
      {
        persistent: true,
      }
    );

    console.log("Sent to queue:", notification);

    setTimeout(() => connection.close(), 500);
  } catch (error) {
    console.error("Failed to send notification:", error.message);
  }
}

export const commentOnStory = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.userId;
  console.log(userId);

  try {
    // Fetch username of the user adding the comment
    const userResult = await pool.query(
      "SELECT username FROM users WHERE _id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = userResult.rows[0].username;

    // Insert the new comment
    const newComment = await pool.query(
      `INSERT INTO post_comments (post_id, comment_id, text, user_id, username, comment_date, seen_by_story_owner) 
         VALUES ($1, gen_random_uuid(), $2, $3, $4, NOW(), false) 
         RETURNING comment_id AS "commentId", text, user_id AS "userId", username, comment_date AS "commentDate", seen_by_story_owner AS "seenByStoryOwner"`,
      [id, text, userId, username]
    );

    // Fetch updated post data
    const postResult = await pool.query(
      `SELECT id AS "_id", caption, category, device, username, user_id AS "userId", image, post_date AS "postDate"
         FROM posts WHERE id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Fetch likes, tags, social, and comments
    const likesResult = await pool.query(
      "SELECT user_id FROM post_likes WHERE post_id = $1",
      [id]
    );
    const tagsResult = await pool.query(
      "SELECT tag FROM post_tags WHERE post_id = $1",
      [id]
    );
    const socialResult = await pool.query(
      "SELECT platform FROM post_social WHERE post_id = $1",
      [id]
    );
    const commentsResult = await pool.query(
      `SELECT c.comment_id AS "commentId", c.text, c.user_id AS "userId", c.username, 
                c.comment_date AS "commentDate", COALESCE(c.seen_by_story_owner, false) AS "seenByStoryOwner"
         FROM post_comments c
         WHERE c.post_id = $1
         ORDER BY c.comment_date ASC`,
      [id]
    );

    // Construct response with the correct structure
    const response = {
      ...postResult.rows[0],
      social: socialResult.rows.map((row) => row.platform),
      tags: tagsResult.rows.map((row) => row.tag),
      likes: likesResult.rows.map((row) => row.user_id),
      comments: commentsResult.rows.map((comment) => ({
        commentId: comment.commentId,
        text: comment.text,
        username: comment.username,
        userId: comment.userId,
        commentDate: comment.commentDate.toISOString(), // Ensure correct format
        seenByStoryOwner: comment.seenByStoryOwner ?? false, // Ensure it's always included
      })),
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.userId;

  try {
    const comment = await pool.query(
      "SELECT * FROM post_comments WHERE post_id = $1 AND comment_id = $2",
      [id, commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }

    await pool.query(
      "DELETE FROM post_comments WHERE post_id = $1 AND comment_id = $2",
      [id, commentId]
    );
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserStories = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    await pool.query("BEGIN"); // Start transaction

    // Get all post IDs associated with the user
    const result = await pool.query("SELECT id FROM posts WHERE user_id = $1", [
      userId,
    ]);
    const postIds = result.rows.map((row) => row.id);

    if (postIds.length === 0) {
      await pool.query("ROLLBACK"); // Rollback in case of no posts found
      return res
        .status(404)
        .json({ message: "No stories found for this user" });
    }

    // Delete related likes
    await pool.query("DELETE FROM post_likes WHERE post_id = ANY($1)", [
      postIds,
    ]);

    // Delete related comments
    await pool.query("DELETE FROM post_comments WHERE post_id = ANY($1)", [
      postIds,
    ]);

    // Delete related tags (if applicable)
    await pool.query("DELETE FROM post_tags WHERE post_id = ANY($1)", [
      postIds,
    ]);

    // Delete related shares (if applicable)
    await pool.query("DELETE FROM post_social WHERE post_id = ANY($1)", [
      postIds,
    ]);

    // Finally, delete all posts by the user
    await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);

    await pool.query("COMMIT"); // Commit transaction

    res.status(200).json({
      message:
        "All stories and related data associated with the user have been deleted",
    });
  } catch (error) {
    await pool.query("ROLLBACK"); // Rollback in case of an error
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserComments = async (req, res) => {
  const { userId } = req.params; // Extract user ID from params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if the user has any comments
    const result = await pool.query(
      "SELECT comment_id FROM post_comments WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this user" });
    }

    // Delete all comments associated with the user
    const deleteResult = await pool.query(
      "DELETE FROM post_comments WHERE user_id = $1 RETURNING *",
      [userId]
    );

    res.status(200).json({
      message: `${deleteResult.rowCount} comments associated with the user have been deleted`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
