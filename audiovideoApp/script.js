//#1
let client = AgoraRTC.createClient({mode:'rtc', 'codec':"vp8"})

//#2



let config = {
    appid: "6a82bc0b6a6145f09d8dfea2a79a4f8a",
    token:'0066a82bc0b6a6145f09d8dfea2a79a4f8aIACNn01WfrxXHS+xj8zDiP9OdwdLA2tCDleB+NkDbju4JZlH8PUAAAAAEADTxV3AvEOOYgEAAQC7Q45i',
    uid:null,
    channel: 'streamm',
}

//#3 - Setting tracks for when user joins
let localTracks = {
    audioTrack:null,
    videoTrack:null
}

//#4 - Want to hold state for users audio and video so user can mute and hide
let localTrackState = {
    audioTrackMuted:false,
    videoTrackMuted:false
}

//#5 - Set remote tracks to store other users
let remoteTracks = {}


//Event listener for the join button
document.getElementById('join-btn').addEventListener('click', async () => {
    config.uid = document.getElementById('username').value

  //try to join the channel with the connection below
    await joinStreams()
    document.getElementById('join-wrapper').style.display = 'none';
    document.getElementById('footer').style.display = 'flex';
});



//Event listener for user the mic button and changing the background color of the button
document.getElementById('mic-btn').addEventListener('click', async () => {
    //Check if what the state of muted currently is
    //Disable button
    if(!localTrackState.audioTrackMuted){
        //Mute your audio
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted = true
        document.getElementById('mic-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
    }else{
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.getElementById('mic-btn').style.backgroundColor ='#1f1f1f8e'

    }

})


//Event listener for user the camera button and changing the background color of the button
document.getElementById('camera-btn').addEventListener('click', async () => {
    //Check if what the state of muted currently is
    //Disable button
    if(!localTrackState.videoTrackMuted){
        //Mute your audio
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted = true
        document.getElementById('camera-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
    }else{
        await localTracks.videoTrack.setMuted(false)
        localTrackState.videoTrackMuted = false
        document.getElementById('camera-btn').style.backgroundColor ='#1f1f1f8e'

    }

})


//Event listener when the user clicks Leave button
document.getElementById('leave-btn').addEventListener('click', async () => {
    //Loop threw local tracks and stop them so unpublish event gets triggered, then set to undefined
    //Hide footer
    for (trackName in localTracks){
        let track = localTracks[trackName]
        if(track){

            //stop camera and mic
            track.stop();

            //disconnect camera and mic
            track.close()
            localTracks[trackName] = null
        }
    }

    //Leave the channel
    await client.leave()
    document.getElementById('footer').style.display = 'none'
    document.getElementById('user-streams').innerHTML = ''
    document.getElementById('join-wrapper').style.display = 'block'

})





let joinStreams = async () => {
    
    //runs the function handleUserJoined when another user joins
    client.on("user-published", handleUserJoined);
    
    //when another user leaves 
    client.on("user-left", handleUserLeft);


    client.enableAudioVolumeIndicator(); // Triggers the "volume-indicator" callback event every two seconds.
    client.on("volume-indicator", function(evt){
        for (let i = 0; evt.length > i; i++){
            let speaker = evt[i].uid
            let volume = evt[i].level
            if(volume > 0){
                document.getElementById(`volume-${speaker}`).src = './assets/volume-on.svg'
            }else{
                document.getElementById(`volume-${speaker}`).src = './assets/volume-off.svg'
            }
            
        
            
        }
    });

    //#6 - Set and get back tracks for local user
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await  Promise.all([
        
        //method to join a channel and send a request to the Agora.io to make a connection
        client.join(config.appid, config.channel, config.token ||null, config.uid ||null),

        //connection mic and camera
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

    ])
    
    //#7 displaying html elements for each of the  users  that are connected to the streams
    // displaying for each of the users
    let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                  </div>`;

    document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);

    //#8 - Player user stream in div
    localTracks.videoTrack.play(`stream-${config.uid}`)
    

    //#9 Add user to user list of names/ids

    //#10 - Publish my local video tracks to entire channel so everyone can see it
    await client.publish([localTracks.audioTrack, localTracks.videoTrack])

}




//This function is gonna handle when a user joins  

let handleUserJoined = async (user, mediaType) => {
    console.log('Handle user joined')

    //#11 - Add user to list of remote users
    remoteTracks[user.uid] = user;

    //#12 Subscribe ro other remote users
    // same as in the function user joined but this happens on the remote side
    await client.subscribe(user, mediaType)
   
    
    //the function when user clicks the video 
    if (mediaType === 'video'){
        
        let player = document.getElementById(`video-wrapper-${user.uid}`)
        
        console.log('player:', player)
        if (player != null){
            player.remove()
        }
 
        player = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" src="./assets/volume-on.svg" /> ${user.uid}</p>
                        <div  class="video-player player" id="stream-${user.uid}"></div>
                      </div>`
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
         user.videoTrack.play(`stream-${user.uid}`)
      
    }
    


    //The function of audio function just to play
    if (mediaType === 'audio') {
        user.audioTrack.play();
      }
}



//This is the function that will be executed when the user leaves the app
let handleUserLeft = (user) => {
    console.log('Handle user left!')
    //Remove from remote users and remove users video wrapper
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`).remove()
}