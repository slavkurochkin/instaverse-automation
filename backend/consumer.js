import WebSocket, { WebSocketServer } from "ws";
import amqp from "amqplib";

// Start WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

// Store messages for offline clients
const pendingMessages = new Map();

wss.on("connection", (ws, req) => {
  try {
    const urlParts = req.url.split("?");
    if (urlParts.length < 2) {
      console.log("Invalid URL, missing query parameters.");
      return;
    }

    const params = new URLSearchParams(urlParts[1]);
    const userId = params.get("userId");

    if (!userId) {
      console.log("User ID is missing from query parameters.");
      return;
    }

    ws.userId = userId;
    console.log(`Client connected - userId: ${ws.userId}`);

    // Check if there are pending messages for this user
    if (pendingMessages.has(userId) && pendingMessages.get(userId).length > 0) {
      console.log(
        `Sending ${pendingMessages.get(userId).length} pending messages to user ${userId}`
      );
      const messages = pendingMessages.get(userId);
      messages.forEach((message) => {
        ws.send(JSON.stringify(message));
      });
      pendingMessages.delete(userId);
    }

    ws.on("close", () => {
      console.log(`Client disconnected - userId: ${ws.userId}`);
    });
  } catch (error) {
    console.error("Error processing WebSocket connection:", error);
  }
});

const sendToSpecificUser = (reciverUserId, message) => {
  let messageSent = false;
  const userIdStr = reciverUserId.toString();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.userId === userIdStr) {
      console.log(`Found client ${userIdStr} online, sending message`);
      client.send(JSON.stringify(message));
      messageSent = true;
    }
  });

  // If user is not online, store the message
  if (!messageSent) {
    console.log(`Client ${userIdStr} is offline, storing message`);
    if (!pendingMessages.has(userIdStr)) {
      pendingMessages.set(userIdStr, []);
    }
    pendingMessages.get(userIdStr).push(message);
  }
};

async function startRabbitMQConsumer() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "notifications";

    await channel.assertQueue(queue, { durable: true });

    console.log(`Listening for messages on queue: ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const notification = JSON.parse(msg.content.toString());
        console.log("Received Notification:", notification);

        const reciverUserId = notification.userId?.toString();
        console.log("Sending notification to userId:", reciverUserId);

        if (reciverUserId) {
          sendToSpecificUser(reciverUserId, notification);
        } else {
          console.error("Notification missing userId:", notification);
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error with RabbitMQ consumer:", error);
  }
}

startRabbitMQConsumer();

export { wss };
