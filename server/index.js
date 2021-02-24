import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import AppRoutes from "./routes/index";
import RoomModel from './models/Room.model'

//import mongo
import {connectDb} from "./config";
connectDb();

//Init server
const app = express();
const PORT = process.env.PORT || 3001;

// express config
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

//Export routes outside of file
AppRoutes(app);


// routes
app.get("/", async (req, res) => {
  res.send(
    "Ok server working.. <br> <a href='/api/v1/example'>Click for test routes..</a>"
  );
});

//socket.io init
var server = require("http").createServer(app);
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = {}; //userIds ordered by roomId
let rooms = {}; // roomIds ordered by userId

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  let name = socket.handshake.query.name;
  console.log("user connected.");
  socket.emit("connected to socket.");

  socket.on("join_room", (payload) => {

    if (users[payload.roomId]) {
      // get max roomsize and compare number of users in room if equals return room_full emit to user
      socket.join(payload.roomId);
      users[payload.roomId].push({
        socketId: socket.id,
        userId: id,
        userName: name,
        isMicrophoneOpen: payload.isMicrophoneOpen,
        isCameraOpen: payload.isCameraOpen,
      });
      rooms[socket.id] = payload.roomId;
      const otherUsers = users[payload.roomId].filter(
        (user) => user.socketId !== socket.id
      );
      socket.emit("other_users", otherUsers);
      socket.to(payload.roomId).broadcast.emit("join_chat", id, name);

      console.log("joined");
    } else {
      socket.join(payload.roomId);
      users[payload.roomId] = [
        {
          socketId: socket.id,
          userId: id,
          userName: name,
          isMicrophoneOpen: payload.isMicrophoneOpen,
          isCameraOpen: payload.isCameraOpen,
        },
      ];
      rooms[socket.id] = payload.roomId;
      //socket.emit("no_room");
      //console.log("no room");
      //disconnect socket
    }
  });

  socket.on("send_message", (payload) => {
    //roomId, senderId, message,
    console.log(payload);
    socket.to(payload.roomId).emit("recieve_message", {
      message: payload.message,
      sender: payload.sender,
    });
  });

  socket.on("change_name", (payload) => {
    name = payload.editedName;
    console.log(payload);
    users[payload.roomId] = users[payload.roomId].map((user) => {
      if (user.userId === id) {
        return { ...user, userName: payload.editedName };
      }
      return user;
    });
    console.log(users[payload.roomId]);
    socket.to(payload.roomId).emit("set_new_user_name", {
      newName: payload.editedName,
      oldName: payload.oldName,
      userId: id,
    });
  });
  socket.on("change_video_settings", (payload) => {
    if (!users[payload.roomId]) return;
    users[payload.roomId] = users[payload.roomId].map((user) => {
      if (user.userId === id) {
        let u = user;
        u.isMicrophoneOpen = payload.isMicrophoneOpen;
        u.isCameraOpen = payload.isCameraOpen;
        return u;
      }
      return user;
    });
    socket.to(payload.roomId).emit("set_changed_video_settings", {
      isMicrophoneOpen: payload.isMicrophoneOpen,
      isCameraOpen: payload.isCameraOpen,
      userId: id,
    });
  });

  socket.on("send_signal", (payload) => {
    io.to(payload.userToSignal).emit("new_join", {
      userId: id,
      userName: name,
      signal: payload.signal,
      callerID: payload.callerID,
      isMicrophoneOpen: payload.isMicrophoneOpen,
      isCameraOpen: payload.isCameraOpen,
    });
  });

  socket.on("return_signal", (payload) => {
    io.to(payload.callerID).emit("receive_returned_signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomId = rooms[socket.id];
    let room = users[roomId];
    if (room) {
      socket.to(roomId).broadcast.emit("user_left", id);
      room = room.filter((user) => user.socketId !== socket.id);
      users[roomId] = room;

      if (!room) {
        delete users[roomId];
      }
    }
    console.log("user disconnected.");
    delete rooms[socket.id];
  });
});

//Running server
server.listen(PORT, () => {
  console.log("Server has benn started at http://localhost:" + PORT);
});
