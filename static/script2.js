import userobjectinfo from "./userObject.js"

// Initializing Firebase webapp
var firebaseConfig = {
  apiKey: "AIzaSyDamobTihmwkpxxCVSb59-yUOMwpkiEoNI",
  authDomain: "video-call-app-copy.firebaseapp.com",
  projectId: "video-call-app-copy",
  storageBucket: "video-call-app-copy.appspot.com",
  messagingSenderId: "474784328760",
  appId: "1:474784328760:web:f7584e4973e0634b57cacd"
};


const base_url = "https://video-meet-webapp.herokuapp.com/";

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore()



let name
let email
let profilephoto
let uid
let admin = false
let adminuid

// Checking the current state of authentication
// If user is signed in Then check connect to meeting if meeting exist else direct back to the homepage
// If user is not signed in take him back to the homepage 

firebase.auth().onAuthStateChanged((user) => {
  if (user) {

    let userobj = userobjectinfo(user)
    name = userobj.name
    email = userobj.email
    profilephoto = userobj.photourl
    uid = user.uid
    db.collection('rooms').doc(meetingId).get().then(
      (result) => {
        if (result.exists) {

          document.getElementById("main__page").classList.remove("hide")
          adminuid = result.data().adminuid
          if (adminuid == uid) admin = true
          superfunction()
        }
        else {
          alert("No such meeting exist");
          window.location.href = base_url;
        }
      }
    )

  }
  else {
    alert("Please sign in to continue")
    window.location.href = base_url;
  }
})









function superfunction() {



  const socket = io('/')
  const videoGrid = document.getElementById('video-grid')
  
  // Initialized peer using javascript peerjs library. 
  
  const myPeer = new Peer(undefined, {
    host: 'peerjs-videoclone.herokuapp.com',
    secure: true,
    port: '443'
  })



  let videostream;
  let presenting = false;
  const myvideo = document.createElement('div')
  // myvideo.muted = true
  addeventtoenlargevideo(myvideo)
  let connectedpeers = {}
  let peerstreams = {}
  let peeridname = {}


  // Capturing webcam video and audio using getUserMedia and then sending it to the other participants 

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {
      echoCancellation: true,
    }
  }).then(stream => {

    // Adding our own video to the screen with audio muted
    addvideo(myvideo, stream, "You", true)
    videostream = stream

    // When some peer make calls (In case you are newly connected participant every other participant of the meeting calls you) 
    // you answer the call and along with that also sends your video and audio to the caller
    myPeer.on("call", call => {
      call.answer(stream);
      const video = document.createElement('div')
      addeventtoenlargevideo(video)
      call.on("stream", userstream => {
        addvideo(video, userstream, peeridname[call.peer])
        peerstreams[call.peer] = userstream
      })
      connectedpeers[call.peer] = call
      call.on("close", () => {
        video.remove();
      })
    })

    // When new particiapnt is connected we make a call to the new participant 
    // and also reconstruct the participant list
    socket.on('user-connected', (userId, name, profilephoto, userlist) => {

      constructparticipantlist(userlist)
      setTimeout(() => { connecttouser(userId, stream, name) }, 500)
    })



  })


  // When participant is disconnected close the connection with that participant

  socket.on('user-disconnected', (userId, name, profilephoto, userlist) => {

    constructparticipantlist(userlist)

    if (connectedpeers[userId]) {
      connectedpeers[userId].close();
      delete connectedpeers.userId
    }
  })

  // As soon as our Peer is initialized we send the message to the meeting that we are connected

  myPeer.on("open", id => {

    socket.emit('join-meeting', meetingId, id, name, profilephoto, uid)
  })


  // It gives us the participant list which we use to construct the current participant list

  socket.on("You-are-connected", userlist => {
    constructparticipantlist(userlist)

  })

  // Function to enlarge the video on which we click

  function addeventtoenlargevideo(video) {
    video.addEventListener('click', () => {
      video.classList.toggle('large-video')
      const videos = document.getElementsByClassName('uservideosdiv');
      for (let i = 0; i < videos.length; i++) {
        if (videos[i] == video) continue
        videos[i].classList.remove('large-video')
      }
    })
  }

  // Function to add add video to the screen 

  function addvideo(video, stream, name, mute = false) {
    let video1 = document.createElement('video')
    video1.srcObject = stream
    const nameobject = document.createElement('div');
    nameobject.innerHTML = `<h6>${name}</h6>`
    nameobject.setAttribute("class", "videoname")
    video1.muted = mute
    video.innerHTML = ""
    video1.addEventListener("loadedmetadata", () => {
      video1.play()
    })
    video.append(video1)
    video.append(nameobject)

    video.setAttribute("class", "uservideosdiv")
    videoGrid.append(video)
  }

  // Function to make call to new participant and send it our stream
  // and add the stream returned by it to the screen 

  function connecttouser(userId, stream, name) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('div')
    addeventtoenlargevideo(video)

    call.on('stream', (userstream) => {

      addvideo(video, userstream, name)

      peerstreams[userId] = userstream

    })
    if (presenting) {
      changetopresenatation();
    }
    call.on('close', () => {
      video.remove()
    })
    connectedpeers[userId] = call
  }


  // videobtn -> button to handle our on/off cam
  // audiobtn -> button to handle mute/unmute our audio
  // muteallbtn-> (only accessible to admin) used to mute every other participant in the meeting
  // videooff -> (only accessible to the admin) used to close video of every other participant in the meeting

  const videobtn = document.getElementById('video')
  const audiobtn = document.getElementById('audio')
  const muteallbtn = document.getElementById('muteall')
  const videoff = document.getElementById('closevideoall')

  videobtn.addEventListener("click", () => {
    let on = videostream.getVideoTracks()[0].enabled;
    if (on) {
      closevideo(videostream)
      document.getElementById("video").innerHTML = '<span class="material-icons">videocam_off</span>'
    }
    else {
      openvideo(videostream)
      document.getElementById("video").innerHTML = '<span class="material-icons">videocam</span>'
    }
  })

  audiobtn.addEventListener("click", () => {
    let on = videostream.getAudioTracks()[0].enabled;
    if (on) {
      mute(videostream)
      document.getElementById("audio").innerHTML = '<span class="material-icons">mic_off</span>'
    }
    else {
      unmute(videostream)
      document.getElementById("audio").innerHTML = '<span class="material-icons">mic</span>'
    }

  })

  document.getElementById("endcall").addEventListener("click", () => {

    window.location.href = base_url;
  })

  // if participant is not admin than muteall and close call video buttons should not be there

  if (admin == false) {

    document.getElementById("mutealldiv").style.display = "none"
    document.getElementById("closevideoalldiv").style.display = "none"
  }
  else {
    muteallbtn.addEventListener("click", () => {
      socket.emit("mute-all")
    })

    videoff.addEventListener("click", () => {
      socket.emit("video-off-all")
    })

  }


  // To share the meeting ID , meeting Url, meeting chat url

  document.getElementById("sharemeetdiv").addEventListener("click", () => {
    const textarea = document.createElement('input')
    textarea.value = `Meeting Code : ${meetingId}
    Meeting url: ${base_url}join/${meetingId}
    Chatroom url: ${base_url}chat/${meetingId}`
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert("Meeting info successfully copied")
  })

  // To mute ourself

  function mute(video) {
    video.getAudioTracks()[0].enabled = false;
  }

  // To unmute ourself

  function unmute(video) {
    video.getAudioTracks()[0].enabled = true;
  }

  // To open our video

  function openvideo(video) {
    video.getVideoTracks()[0].enabled = true;
  }

  // To close our video

  function closevideo(video) {
    video.getVideoTracks()[0].enabled = false;
  }




  // Retrieving messages from the firestore database from specefic meeting Id 
  // Then adding these messages to the screen of the user

  db.collection("rooms").doc(meetingId).collection('messages').orderBy("time", "asc").onSnapshot((snapshot) => {
    document.getElementById("messages").innerHTML = ""
    snapshot.docs.map((doc) => addChat(doc.data()))
  })

  // user sending new messages are saved in the firestore database

  const input = document.getElementById("input")
  input.addEventListener("submit", (e) => {
    e.preventDefault()
    let message = document.getElementById("messagetext").value
    let chatname = name;
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    let time;
    if (h < 10 && m < 10)
      time = `0${h}:0${m}`
    else if (h > 10 && m < 10)
      time = `${h}:0${m}`
    else
      time = `${h}:${m}`
    let timestamp = d.getTime();
    if (message.length != 0) {
      document.getElementById("messagetext").value = "";
      db.collection('rooms').doc(meetingId).collection('messages').add({
        message: message,
        name: chatname,
        profilephoto: profilephoto,
        time: timestamp,
        currenttime: time,
        uid: uid
      })
    }
  })



  socket.on("mute-yourself", () => {
    mute(videostream)
    document.getElementById("audio").innerHTML = '<span class="material-icons">mic_off</span>'

  })

  socket.on("off-video", () => {
    closevideo(videostream)
    document.getElementById("video").innerHTML = '<span class="material-icons">videocam_off</span>'

  })


  // Function to construct chat element from message objects we get from the database

  function addChat(object) {
    const nameele = document.createElement('div')
    const messagele = document.createElement('div')
    const chatele = document.createElement('div')
    let name
    if(object.uid==uid) name = "You"
    else name = object.name
    nameele.innerHTML = `${name} <span>  ${object.currenttime} </span>`
    messagele.innerHTML = object.message
    nameele.classList.add('sender_name')
    messagele.classList.add('sender_message')
    chatele.append(nameele)
    chatele.append(messagele)
    document.getElementById("messages").append(chatele)
  }


  const participantbutton = document.getElementById("participants")
  const participantlist = document.getElementById("participantlist")
  const chatmessagesbutton = document.getElementById("chatmessages")
  participantbutton.addEventListener("click", () => {
    participantlist.classList.remove("hide")
    document.getElementById("messages").classList.add("hide")
    participantbutton.classList.add("shaded")
    chatmessagesbutton.classList.remove("shaded")
  })


  chatmessagesbutton.addEventListener("click", () => {
    document.getElementById("messages").classList.remove("hide")
    participantlist.classList.add("hide")
    participantbutton.classList.remove("shaded")
    chatmessagesbutton.classList.add("shaded")
  })



 // Function to construct participant list element and display on the screen
 // using userinfo which contains current participant information

  function constructparticipantlist(userinfo) {

    peeridname = {}

    for (let i = 0; i < userinfo.length; i++) {
      peeridname[userinfo[i].id] = userinfo[i].name
    }

    const participantlist = document.getElementById("participantlist");
    participantlist.innerHTML = "";
    for (let i = 0; i < userinfo.length; i++) {
      const namediv = document.createElement('div');
      const photodiv = document.createElement('div');
      if (adminuid == userinfo[i].uid)
        namediv.innerHTML = userinfo[i].name + "<span>(admin)</span>"
      else
        namediv.innerHTML = userinfo[i].name

      photodiv.style.backgroundImage = `url(${userinfo[i].profilephotourl})`
      photodiv.classList.add("profilephoto")
      photodiv.style.borderColor = "white"
      const participant = document.createElement('div')
      participant.append(photodiv)
      participant.append(namediv)
      participant.setAttribute('id', 'single-participant')
      participantlist.append(participant)
    }
  }


  const chatmessageswitch = document.getElementById("chatmessagediv")
  chatmessageswitch.addEventListener("click", () => {
    document.getElementById("main_app_right").classList.toggle("hide")
  })



}