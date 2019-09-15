const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const server = http.createServer(app);
const io = socketio(server);

const {addUser,getuser,getuserinroom,removeuser} = require('./utils/users');

const publicDirectoryPath = path.join(__dirname,'../public');
const viewPath = path.join(__dirname,'../templates/views');
const partialsPath = path.join(__dirname,'../templates/partials');

const port = process.env.PORT || 3000;

app.set('view engine','hbs');
app.set('views',viewPath);
hbs.registerPartials(partialsPath);
const generateMessage = require('../src/utils/messages');

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection',(socket)=>{

    socket.on("join",({username,room},callback)=>{
        const {error,user} = addUser({
            id:socket.id,
            username,
            room
        })

        if(error){
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message',generateMessage("Admin",`welcome!`));
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${username} has just joined`));
        
        io.to(user.room).emit("roomdata",{
            room:user.room,
            users:getuserinroom(user.room)
        })

        callback();
    })

    socket.on("sendMessage",(message,callback)=>{
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('profanity is not allowed');
        }
        const user = getuser(socket.id);
        
        if(user){
            io.to(user.room).emit("message",generateMessage(user.username,message));
            callback();
        }
    })     

    socket.on('disconnect',()=>{
        const user = removeuser(socket.id);
        if(user){
            io.to(user.room).emit("message",generateMessage(user.username,`${user.username} has left`));
            io.to(user.room).emit("roomdata",{
                room:user.room,
                users:getuserinroom(user.room)
            })
        }
    })

    socket.on("sendLocation",(position,callback)=>{
        const user = getuser(socket.id);
        if(user){
            io.to(user.room).emit("message",generateMessage(user.username,message));
            callback();
        }
    })

})

server.listen(port,()=>{
    console.log("server is running at "+port);
});