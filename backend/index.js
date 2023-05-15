const express = require("express");
const app = express();
require('dotenv').config()
const socketio = require("socket.io");
const { userRouter } = require("./routes/userRoutes");
const mongoose = require("mongoose");
var randomId = require("random-id");
const { User, update_word_function } = require("./user");
let { users } = require("./user");
let cors = require("cors");
let { connection } = require("./db");
const { groups, handleParagraph,deleteRoooID } = require("./handleParagraph");
app.use(cors());
app.use(express.json());

app.use(userRouter);

// length of the id (default is 30)
var len = 10;

// pattern to determin how the id will be generated
// default is aA0 it has a chance for lowercased capitals and numbers
var pattern = "aA0";

const expressServer = app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log(error.message);
  }
  console.log("server running");
});

const io = socketio(expressServer);

// here is the paragraph that I'll be sending to each user.
let para = [
  "The sun sets over the ocean, casting a warm orange glow across the water. Waves gently crash against the shore, creating a peaceful rhythm. Seagulls cry out in the distance, adding to the serenity of the moment. ",
  "The scent of fresh flowers fills the air as you walk through a field of blooming wildflowers. Butterflies flutter around you, their colorful wings a beautiful contrast against the greenery. The sound of birds singing completes the idyllic scene. ",
  "As you hike up a mountain trail, the scenery becomes more and more breathtaking. The air is crisp and clean, and you can feel the sun warming your skin. At the top, you are rewarded with a stunning panoramic view. ",
  "Sitting by a crackling fire on a chilly evening is a cozy and comforting experience. The warmth of the flames envelops you, and the sound of logs popping and crackling is soothing. Sipping on a hot drink completes the perfect evening. ",
  "Watching a thunderstorm from the safety of your home is a mesmerizing experience. The sound of raindrops tapping against the windows and the flashes of lightning create a calming atmosphere. The smell of fresh rain is a refreshing bonus. ",
  "Walking along a beach on a sunny day is a relaxing and rejuvenating experience. The sand squishes beneath your toes, and the sound of the waves is hypnotic. Seashells and other treasures can be found along the shore. ",
  "Standing in a forest surrounded by tall trees and chirping birds is a humbling experience. The air is cool and refreshing, and the earthy scents are invigorating. Taking a deep breath of fresh forest air is a great way to clear your mind. ",
  "Driving down a scenic road with beautiful views on either side is a thrilling experience. The wind in your hair and the sun on your face make you feel alive. Stopping to take in the view and snap a photo is a must. ",
  "Sitting outside on a warm summer night, watching the stars twinkle above you is a magical experience. The stillness of the night and the beauty of the stars is awe-inspiring. It's a great reminder of how small we are in the grand scheme of things. ",
  "Curling up with a good book on a rainy day is a cozy and relaxing experience. The sound of rain tapping against the windows and the feeling of being wrapped up in a blanket is perfect for getting lost in a good story. ",
];

//This function is to create a random number between 0 to para.length - 1. this will serve as
// the indexes. so that I will access one random paragraph from the array para.
function generateRandomNumber() {
  let random = Math.floor(Math.random() * para.length);
  return random;
}

//on connection
let count = 0;

io.on("connection", (socket) => {
  count += 1;

  socket.on("username", ({ username }) => {
    var id = randomId(len, pattern);
    socket.emit("roomno", id);
  });

  let Room;
  socket.on("joinroom", ({ username, roomvalue }) => {
    const user = User(socket.id, username, roomvalue);
    // console.log(roomvalue + "from join room");
    // console.log(socket.id + "from line no 68");
    socket.join(roomvalue);
    Room = roomvalue;
    let user_Data = users.filter((ele) => {
      return ele.roomvalue == Room;
    });
    if (handleParagraph(roomvalue)) {
      io.to(roomvalue).emit("usersarray", [user_Data, groups[roomvalue]]);
    } else {
      let selectedpara = para[generateRandomNumber()];
      groups[roomvalue] = selectedpara;
      io.to(roomvalue).emit("usersarray", [user_Data, groups[roomvalue]]);
    }

    //io.emit("usersarray", user_Data);
    socket.emit("message", "WELCOME TO RACE BUDDY 😉");
  });

  console.log(`One user connected, total user : ${count}`);
socket.on("delete",(roomid)=>{
  users=users.filter((ele)=>{
   return ele.roomvalue!==roomid
  })
  deleteRoooID(roomid)
})

  socket.on("timeleft", (data) => {
    let { timeleft } = data;
    socket.broadcast.to(Room).emit("Time", { timeleft });
  });
  io.emit("user count", count);

  socket.on("display", (data) => {
    socket.broadcast.to(Room).emit("forall", data);
  });

  //recieving the typed text from client on "typeText" Event
  socket.on("typedText", ({ typedText }) => {
    console.log(`person having id ${socket.id} is typing :`, typedText);

    //here checking the latest letter is same as in paragraph at that posistion
    if (
      typedText[typedText.length - 1] == groups[Room][typedText.length - 1] &&
      includeFunction(groups[Room], typedText)
    ) {
      //if the user has typed the entire paragraph then this will be sent to the frontend
      if (typedText.length == groups[Room].length) {
        console.log(typedText);
        return socket.emit("typing-update", {
          typedText: "You have finished the race buddy 👏👏👏",
          flag: "Race Completed",
        });
      }
      //here whenever the typed text is ' ', i'm calling the update_word_function which is increasing the count or word
      if (typedText[typedText.length - 1] == " ") {
        let user = update_word_function(socket.id, typedText);
        console.log(user);
        console.log(user[0]);
        //after updating the word, emitting the user_data in the room, which will contain socket.id, total words that he typed,etc.
        io.to(user[0].roomvalue).emit("user_data", user[0]);
      }

      //after validating the typed text, sending the response to the frontend accordingly
      socket.emit("typing-update", {
        typedText,
        isTyping: true,
        socketID: socket.id,
        flag: true,
      });
    } else {
      socket.emit("typing-update", {
        typedText,
        isTyping: false,
        socketID: socket.id,
        flag: false,
      });
    }
  });
  //disconnet
  socket.on("disconnect", () => {
    count -= 1;
    console.log(`One user left, ${count} remaining!!`);
    io.emit("user count", count);
  });
});

/*Here I am checking if the coming typed paragraph is included by the our normal paragraph or not  */
const includeFunction = (myParagraph, typedText) => {
  if (myParagraph.includes(typedText)) {
    return true;
  } else {
    return false;
  }
};

module.exports = { count };
