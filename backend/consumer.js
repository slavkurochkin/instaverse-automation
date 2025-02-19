import WebSocket, { WebSocketServer } from "ws";
import amqp from "amqplib";

// Start WebSocket Server
const wss = new WebSocketServer({ port: 8080 });
let reciverUserId = "";

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

    if (userId === reciverUserId) {
      // Check if there were pending messages
      if (
        pendingMessages.has(reciverUserId) &&
        pendingMessages.get(reciverUserId).length > 0
      ) {
        console.log(`Sending pending messages to user 2`);
        const messages = pendingMessages.get(reciverUserId);
        messages.forEach((message) => {
          ws.send(JSON.stringify(message));
        });
        pendingMessages.delete(reciverUserId);
      } else {
        // Only send "user_back_online" if there were *no* pending messages
        console.log("No pending messages, sending user_back_online");
        const notification = {
          type: "user_back_online",
          userId: reciverUserId,
        };
        ws.send(JSON.stringify(notification));
      }
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

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.userId === reciverUserId
    ) {
      console.log("Found client 2 online, sending message");
      client.send(JSON.stringify(message));
      messageSent = true;
    }
  });

  // If user 2 is not online, store the message
  if (!messageSent) {
    console.log("Client 2 is offline, storing message");
    if (!pendingMessages.has(reciverUserId)) {
      pendingMessages.set(reciverUserId, []);
    }
    pendingMessages.get(reciverUserId).push(message);
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

        console.log("notification.userId:", notification.userId);
        reciverUserId = notification.userId.toString();
        sendToSpecificUser(reciverUserId, notification);

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error with RabbitMQ consumer:", error);
  }
}

startRabbitMQConsumer();

export { wss };
