const socket = io();

const chatForm  = document.getElementById('chat-form');
const messageInput = document.getElementById('msg');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const FILE = document.getElementById('file-upload');
var fileValueToBeExported = '';

    //Get username room and URL
    const { username, room }  = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    console.log(username, room);

    //JOin Chat room
    socket.emit('joinRoom', {username, room})

    //Get room and users
    socket.on('roomUsers', ({room, users}) => {
        outputRoomName(room);
        outputUsers(users);
        
    })

    socket.on('message', (message) => {
        console.log(message);
        outputMessage(message);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();



            //Get the message 
            const msgg = e.target.elements.msg.value;
            const patientName = e.target.elements.ptName.value;

            const fileContent = FILE.value;

            console.log(msgg);
            console.log(fileContent);
            console.log(patientName);

            const realFile = fileContent.split("\\");
            const labContent = realFile.pop();
            console.log(labContent);

            fileValueToBeExported = labContent;
            console.log('The NEW variable '  + fileValueToBeExported);

            //emit the message to the server
            socket.emit("chatMessage", msgg, labContent,patientName);

            messageInput.value = '';
            FILE.value = '';
            e.target.elements.ptName.value ='';

            messageInput.focus();


        })



function outputMessage(message){
     const div = document.createElement('div');
     div.classList.add('message');
     div.innerHTML = `<p class="meta">${message.username} <span> ${message.time} </span></p>


                <p class="text">
                            ${message.text}
                        </p>
                <a href="/download" target="_blank" id="linku" class="${message.labFile == undefined || message.patientName ==''? 'none': 'block'}"> ${message.patientName}</a> 
                        `;

    document.querySelector('.chat-messages').appendChild(div);
}


// Add room name to DOM
function outputRoomName(room) {
    const roomName = document.getElementById('room-name');
    roomName.innerText = room;
  }



  function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
  }


