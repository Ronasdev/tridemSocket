const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
require("dotenv").config();
const cors = require('cors');

const app = express();
// app.use(cors({ origin: process.env.FRONT_URL }))
app.use(cors({ origin: "*" }))
const server = http.createServer(app);
const io = new Server(server);



let onlineUsers = [];
let newTrides = [];

const addNewUser = (user, socketId) => {
    console.log("online: user: ", user);

    !onlineUsers.some((user) => user.id === user?.id) &&
        onlineUsers.push({ ...user, socketId });

    console.log("online:onlineUsers: ", onlineUsers);
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
    console.log(`Utilisateur ${onlineUsers.firstname} déconnecté`);
};

const getUser = (id) => {
    return onlineUsers.find(user => user.id === id)
}
const addNewTride = (tridaire, tride) => {
    newTrides.push({ tridaire, tride, socketId })
}

io.on('connection', (socket) => {
    console.log('A user is connected');

    socket.on("newUser", (user) => {
        console.log(`${user?.firstname} vient de se connecté`);
        addNewUser(user, socket.id);
    });

    socket.on('sendNewTrideNotification', ({ tridaire, triand }) => {
        const receiver = getUser(triand?._id);
        console.log("triand: ", triand);
        console.log("sendNewTrideNotif: ", receiver);
        if (receiver) {
            io.to(receiver?.socketId).emit("getNewTrideNotification", {
                // tridaire,
                // triand,
                message: `${tridaire?.firstname} ${tridaire?.lastname} (le Tridaire ) vous a fait une demande de trid`
            })
        }
    });

    // socket.on('sendText', ({ senderName, receiverName, text }) => {
    //     const receiver = getUser(receiverName);
    //     io.to(receiver?.socketId).emit("getText", {
    //         senderName,
    //         text
    //     })
    // });

    socket.on('disconnect', () => {
        removeUser(socket.id);
    })

});



const PORT = 7000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});