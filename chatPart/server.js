const path = require('path');
const express = require('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const { formatMessage,vlera1,vlera2,vlera3 } = require("./utils/messages");
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users');

const url = require('url');

let fileVariable = '';


const { Server } = require("socket.io");
const io = new Server(server);

//Getting static files from the front end part
app.use(express.static(path.join(__dirname, 'public')));




// app.get('/onlineMeeting', (req,res) => {
    
// // console.log(`${__dirname}/videoapp/index.html`);
//     res.sendFile(`${__dirname}/videoapp/`);
//     //  res.redirect('www.google.com');
// });


//runs when clients connects
io.on('connection', (socket) => {
    console.log('a user connected');

    const botName = "Chat Admin bot"

    socket.on('joinRoom', ({username,room}) => {
     const user = userJoin(socket.id,username,room)

         socket.join(user.room);
         
            //Welcome the current user
            socket
            .emit('message', 
            formatMessage(botName, "Welcome to the doctors commucation system"));

            //Broadcast when user connects
            socket.broadcast
            .to(user.room)
            .emit(
              'message',
              formatMessage(botName, `${user.username} has joined the chat`)
            );


            //Send users and room info
            io.to(user.room).emit('roomUsers',  {
                room: user.room,
                users: getRoomUsers(user.room)
                
            })
    })

    

    //Runs when the user disconnects
    socket.on('disconnect', () => { 
         const user = userLeave(socket.id);

         if (user) {
             io.to(user.room).emit('message', formatMessage(botName,`${user.username} left the chat`));
         }
         
    });

    //Listen for the chat message
    socket.on('chatMessage', (message ,lab,patientName) =>{

         const user = getCurrentUser(socket.id);


         fileVariable = lab;
           io.to(user.room).emit('message', formatMessage(user.username, message,lab,patientName));
    })


});
  

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));



app.get('/download', function(req, res){
    const file = `${__dirname}/utils/${fileVariable}`;
    res.download(file); 
});