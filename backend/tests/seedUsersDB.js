import pool from "../db.js";

const insertUsers = async () => {
  try {
    const client = await pool.connect(); // Connect to the database
    console.log("Connected to the database.");

    const query = `
        INSERT INTO users (username, role, age, gender, bio, favorite_style, total_posts, email, password)  
        VALUES  
            ('john_doe', 'admin', '1990-05-15', 'male', 'Tech enthusiast and blogger.', 'minimalist', 10, 'john.doe@example.com', '$2a$12$6GVrudvnEIl8YOZglieh.Odlguv1eOYYY6eLqkc3MQyKYa1z1mBNu'),  
            ('jane_smith', 'user', '1995-09-22', 'female', 'Loves photography and travel.', 'bohemian', 25, 'jane.smith@example.com', '$2a$12$6GVrudvnEIl8YOZglieh.Odlguv1eOYYY6eLqkc3MQyKYa1z1mBNu'),  
            ('alice_wonder', 'moderator', '1988-03-10', 'female', 'Community manager and writer.', 'vintage', 7, 'alice.wonder@example.com', '$2a$12$6GVrudvnEIl8YOZglieh.Odlguv1eOYYY6eLqkc3MQyKYa1z1mBNu'),  
            ('bob_builder', 'user', '1985-07-29', 'male', 'DIY enthusiast and woodworker.', 'industrial', 15, 'bob.builder@example.com', '$2a$12$6GVrudvnEIl8YOZglieh.Odlguv1eOYYY6eLqkc3MQyKYa1z1mBNu'),  
            ('charlie_dev', 'admin', '1992-11-05', 'male', 'Full-stack developer and open-source contributor.', 'modern', 30, 'charlie.dev@example.com', '$2a$12$6GVrudvnEIl8YOZglieh.Odlguv1eOYYY6eLqkc3MQyKYa1z1mBNu');  
    `;

    const startTime = process.hrtime(); // Start timer
    await client.query(query);
    const endTime = process.hrtime(startTime); // End timer

    // Convert time to seconds and milliseconds
    const timeInMs = endTime[0] * 1000 + endTime[1] / 1e6;
    const timeInSec = timeInMs / 1000;

    console.log(
      `Query executed successfully in ${timeInMs.toFixed(3)} ms (${timeInSec.toFixed(3)} s).`
    );

    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await pool.end(); // Close pool connection
    console.log("Database connection closed.");
  }
};

insertUsers();
