import userobjectinfo from "./userObject.js"


var firebaseConfig = {
  apiKey: "AIzaSyB1Dcbxh_ERRibO87DChqZIpJYD-2mHdlA",
  authDomain: "video-call-app-b2276.firebaseapp.com",
  projectId: "video-call-app-b2276",
  storageBucket: "video-call-app-b2276.appspot.com",
  messagingSenderId: "449233312883",
  appId: "1:449233312883:web:a90579bb6dac30d1dc1e06"
};


firebase.initializeApp(firebaseConfig);
var db = firebase.firestore()



let name
let email
let profilephoto
let uid
let admin = false
let adminuid
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // console.log(userobjectinfo(user))
    let userobj = userobjectinfo(user)
    name = userobj.name
    email = userobj.email
    profilephoto = userobj.photourl
    uid = user.uid
    db.collection('rooms').doc(meetingId).get().then(
      (result) => {
        if (result.exists) {
          // console.log("exist")
          document.getElementById("main__page").classList.remove("hide")
          if(result.data().adminuid == uid) admin = true
          adminuid = result.data().adminuid

        }
        else {
          alert("No such meeting exist");
          window.location.href = "http://localhost:3000"
        }
      }
    )
    superfunction()
    // var q = roomref.where("meetingid","==",meetingId)
    // console.log(roomref);

  }
  else {
    console.log("not signed in")
    alert("Please sign in to continue")
    window.location.href = "http://localhost:3000/";
  }
})























function superfunction() {
  
  
  const socket = io('/')
  const videoGrid = document.getElementById('video-grid')
  const myPeer = new Peer(undefined, {
    host: 'peerjs-videoclone.herokuapp.com',
    secure: true,
    port: '443'
  })



  let videostream;
  const myvideo = document.createElement('video')
  myvideo.muted = true
  let connectedpeers = {}
  let peerstreams = {}


  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  }).then(stream => {
    addvideo(myvideo, stream)
    videostream = stream
    myPeer.on("call", call => {
      call.answer(stream);
      const video = document.createElement('video')
      call.on("stream", userstream => {
        addvideo(video, userstream)
        peerstreams[call.peer] = userstream
      })
      connectedpeers[call.peer] = call
      call.on("close", () => {
        video.remove();
      })
    })
    socket.on('user-connected', (userId, name,profilephoto ,userlist) => {

      // console.log("connecting to ", name);
      // console.log(name," joined the meeting")
      constructparticipantlist(userlist)
      // console.log(userlist)
      setTimeout(() => { connecttouser(userId, stream) }, 500)
    })



  })



  socket.on('user-disconnected', (userId, name,profilephoto,userlist) => {
    // console.log("user disconnected ", userId)
    // console.log(name, " left the meeting")
    constructparticipantlist(userlist)
    // console.log(userlist)
    if (connectedpeers[userId]) {
      connectedpeers[userId].close();
      delete connectedpeers.userId
    }
  })

  myPeer.on("open", id => {
    // console.log(name)

    // db.collection('rooms').doc(meetingId).update({
    //   participants:firebase.firestore.FieldValue.arrayUnion({
    //     name:name,
    //     userid:id,
    //     profilephoto:profilephoto
    //   })
    // })
    socket.emit('join-meeting', meetingId, id, name,profilephoto,uid)
  })

// socket.on("disconnect-yourself",function(){
//       db.collection('rooms').doc(meetingId).update({
//       participants:firebase.firestore.FieldValue.arrayRemove({
//         name:name,
//         userid:myPeer.id,
//         profilephoto:profilephoto
//       })
//     })
//   }
//   )

  socket.on("You-are-connected",userlist=>{
    constructparticipantlist(userlist)
    // console.log(userlist);
  })

  function addvideo(video, stream) {
    openvideo(stream)
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
      video.play()
    })
    videoGrid.append(video)
  }

  function connecttouser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', (userstream) => {
      addvideo(video, userstream)
      peerstreams[userId] = userstream

    })
    call.on('close', () => {
      video.remove()
    })
    connectedpeers[userId] = call
  }




  const videobtn = document.getElementById('video')
  const audiobtn = document.getElementById('audio')
  const muteallbtn = document.getElementById('muteall')
  const videoff = document.getElementById('closevideoall')

  videobtn.addEventListener("click", () => {
    let on = videostream.getVideoTracks()[0].enabled;
    if (on)
      {
        closevideo(videostream)
        document.getElementById("video").innerHTML = '<span class="material-icons">videocam_off</span>'
      }
    else
      {
        openvideo(videostream)
        document.getElementById("video").innerHTML = '<span class="material-icons">videocam</span>'
      }
  })

  audiobtn.addEventListener("click", () => {
    let on = videostream.getAudioTracks()[0].enabled;
    if (on)
      {
        mute(videostream)
        document.getElementById("audio").innerHTML = '<span class="material-icons">mic_off</span>'
      }
    else
      {
        unmute(videostream)
        document.getElementById("audio").innerHTML = '<span class="material-icons">mic</span>'
      }

  })

  if(!admin)
  {
    document.getElementById("mutealldiv").style.display = "none"
    document.getElementById("closevideoalldiv").style.display = "none"
  }
  else
  {
  muteallbtn.addEventListener("click", () => {
    socket.emit("mute-all")
  })

  videoff.addEventListener("click", () => {
    socket.emit("video-off-all")
  })

  }
  function mute(video) {
    video.getAudioTracks()[0].enabled = false;
  }

  function unmute(video) {
    video.getAudioTracks()[0].enabled = true;
  }

  function openvideo(video) {
    video.getVideoTracks()[0].enabled = true;
  }

  function closevideo(video) {
    video.getVideoTracks()[0].enabled = false;
  }

  // allvideobtn.addEventListener("click",()=>{
  //   for (let key in peerstreams)
  //   {
  //     let stream1 = peerstreams[key]
  //     let on = stream1.getVideoTracks()[0].enabled
  //     if(on)
  //       stream1.getVideoTracks()[0].enabled = false
  //   }
  // })

  const button = document.getElementById("input")
  button.addEventListener("submit", (e) => {
    e.preventDefault()
    let message = document.getElementById("messagetext").value
    if (message.length != 0) {
      document.getElementById("messagetext").value = "";
      console.log(message);
      socket.emit("send-message", message)
    }
  })

  socket.on("new-message", (message, Sendername) => {
    console.log(Sendername, " send the message ", message);
    addChat(Sendername, message)
  })

  socket.on("my-message", (message) => {
    console.log("You send the message ", message);
    addChat("You", message)
  })

  socket.on("mute-yourself", () => {
    mute(videostream)
  })

  socket.on("off-video", () => {
    closevideo(videostream)
  })

  function addChat(name, message) {
    const nameele = document.createElement('div')
    const messagele = document.createElement('div')
    const chatele = document.createElement('div')
    const d = new Date()
    let curhour = d.getHours()
    let curmin = d.getMinutes()
    nameele.innerHTML = `${name} <span>  ${curhour}:${curmin} </span>`
    messagele.innerHTML = message
    nameele.classList.add('sender_name')
    messagele.classList.add('sender_message')
    chatele.append(nameele)
    chatele.append(messagele)
    document.getElementById("messages").append(chatele)
  }

const participantbutton = document.getElementById("participants")
const participantlist = document.getElementById("participantlist")
const chatmessagesbutton = document.getElementById("chatmessages")
participantbutton.addEventListener("click",()=>{
participantlist.classList.remove("hide")
document.getElementById("messages").classList.add("hide")
participantbutton.classList.add("shaded")
chatmessagesbutton.classList.remove("shaded")
})


chatmessagesbutton.addEventListener("click",()=>{
  document.getElementById("messages").classList.remove("hide")
  participantlist.classList.add("hide")
  participantbutton.classList.remove("shaded")
chatmessagesbutton.classList.add("shaded")
})


}


function constructparticipantlist(userinfo)
{ console.log(userinfo)
  const participantlist = document.getElementById("participantlist");
  participantlist.innerHTML = "";
  for(let i=0;i<userinfo.length;i++)
  {
    const namediv = document.createElement('div');
    const photodiv = document.createElement('div');
    if(adminuid==userinfo[i].uid)
    namediv.innerHTML = userinfo[i].name + "<span>(admin)</span>"
    else
    namediv.innerHTML = userinfo[i].name
    
    photodiv.style.backgroundImage = `url(${userinfo[i].profilephotourl})`
    photodiv.classList.add("profilephoto")
    const participant = document.createElement('div')
    participant.append(photodiv)
    participant.append(namediv)
    participant.setAttribute('id','single-participant')
    participantlist.append(participant)
  }
}

// db.collection('rooms').doc(meetingId).onSnapshot(doc=>{
//   constructparticipantlist(doc.data().participants)
//   console.log(doc.data().participants)
// })
const chatmessageswitch = document.getElementById("chatmessagediv")
chatmessageswitch.addEventListener("click",()=>{
  document.getElementById("main_app_right").classList.toggle("hide")
})
