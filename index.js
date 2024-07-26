const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
require("dotenv").config();
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.FRONT_URL }))
// app.use(cors({ origin: "*" }))
const server = http.createServer(app);
const io = new Server(server);



let onlineUsers = [];
let newTrides = [];

const addNewUser = (user, socketId) => {
    // console.log("online: user: ", user);

    !onlineUsers.some((user) => user.id === user?.id) &&
        onlineUsers.push({ ...user, socketId });

    // console.log("online:onlineUsers: ", onlineUsers);
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
    console.log(`Un Utilisateur est déconnecté`);
};

const getUser = (id) => {
    return onlineUsers.find(user => user.id === id)
}

io.on('connection', (socket) => {
    // console.log('A user is connected');

    socket.on("newUser", (user) => {
        console.log(`${user?.firstname} vient de se connecté`);
        addNewUser(user, socket.id);
    });
    socket.emit('userConnected', onlineUsers);

    socket.on('sendNewTrideNotification', (data) => {
        console.log("sendNewTrideNotification: ",data);

        const receiver = getUser(data?.recipient);
        console.log("sendNewTrideNotif: ", receiver);
        console.log("receiver: socketId ", receiver?.socketId);
        if (receiver) {
            io.to(receiver?.socketId).emit("getNewTrideNotification", data)
        }
    });


    socket.on('sendNewRouteAskedNotification', (data) => {
        console.log("sendNewRouteAskedNotification: ", data);
        const receiver = getUser(data?.recipient);
        console.log("sendNewTrideNotif: ", receiver);
        if (receiver) {
            io.to(receiver?.socketId).emit("getNewRouteAskedNotification", data)
        }
    });

    socket.on('sendResetRouteAskedNotification', (data) => {
        console.log("sendResetRouteAskedNotification: ", data);
        const receiver = getUser(data?.recipient);
       
        console.log("sendNewTrideNotif: ", receiver);
        if (receiver) {
            io.to(receiver?.socketId).emit("getResetRouteAskedNotification", data)
        }
    });
    socket.on('sendAcceptRouteNotification', (data) => {
        console.log("sendAcceptRouteNotification: ", data);
        const receiver = getUser(data?.recipient);
       
        console.log("receiver: ", receiver);
        if (receiver) {
            io.to(receiver?.socketId).emit("getAcceptRouteNotification", data)
        }
    });
    socket.on('sendRefuseRouteNotification', (data) => {
        console.log("sendRefuseRouteNotification: ", data);
        const receiver = getUser(data?.recipient);
       
        console.log("receiver: ", receiver);
        if (receiver) {
            io.to(receiver?.socketId).emit("getRefuseRouteNotification", data)
        }
    });


    socket.on('messageChatSend', (data) => {
        // const { data } = message;
        console.log('messageChat', data);
  
        const receiverSocket = getUser(data?.receiver);
        console.log("receiver: ", receiverSocket);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('messageChat', data);
        }
      });


    socket.on('disconnect', () => {
        removeUser(socket.id);
    })

});



const PORT = 7000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});