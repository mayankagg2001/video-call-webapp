import userobjectinfo from "./userObject.js"


var firebaseConfig = {
  apiKey: "AIzaSyDamobTihmwkpxxCVSb59-yUOMwpkiEoNI",
  authDomain: "video-call-app-copy.firebaseapp.com",
  projectId: "video-call-app-copy",
  storageBucket: "video-call-app-copy.appspot.com",
  messagingSenderId: "474784328760",
  appId: "1:474784328760:web:f7584e4973e0634b57cacd"
};


const base_url = "http://localhost:3000/";

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
          console.log("exist")
          document.getElementById("main__page").classList.remove("hide")
          adminuid = result.data().adminuid
          if (adminuid == uid) admin = true
          // console.log(admin)
          superfunction()
        }
        else {
          alert("No such meeting exist");
          window.location.href = base_url;
        }
      }
    )
    // var q = roomref.where("meetingid","==",meetingId)
    // console.log(roomref);

  }
  else {
    console.log("not signed in")
    alert("Please sign in to continue")
    window.location.href = base_url;
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
  let presenting = false;
  const myvideo = document.createElement('div')
  // myvideo.muted = true
  addeventtoenlargevideo(myvideo)
  let connectedpeers = {}
  let peerstreams = {}
  let peeridname = {}

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  }).then(stream => {
    addvideo(myvideo, stream, "You", true)
    videostream = stream
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
    socket.on('user-connected', (userId, name, profilephoto, userlist) => {

      console.log("connecting to ", name);
      constructparticipantlist(userlist)
      setTimeout(() => { connecttouser(userId, stream, name) }, 500)
    })



  })



  socket.on('user-disconnected', (userId, name, profilephoto, userlist) => {
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
    socket.emit('join-meeting', meetingId, id, name, profilephoto, uid)
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

  socket.on("You-are-connected", userlist => {
    constructparticipantlist(userlist)
    // console.log(userlist);
  })


  function addeventtoenlargevideo(video) {
    video.addEventListener('click', () => {
      video.classList.toggle('large-video')
      const videos = document.getElementsByClassName('uservideosdiv');
      for (let i = 0; i < videos.length; i++) {
        console.log(videos[i])
        if (videos[i] == video) continue
        videos[i].classList.remove('large-video')
      }
    })
  }

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
    // const gridcell = document.createElement('div');
    // gridcell.append(video)
    // gridcell.append(nameobject)
    video.setAttribute("class", "uservideosdiv")
    videoGrid.append(video)
  }

  function connecttouser(userId, stream, name) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('div')
    addeventtoenlargevideo(video)
    console.log(userId)
    call.on('stream', (userstream) => {
      console.log("here")
      addvideo(video, userstream, name)
      // console.log(userstream)
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
    // socket.emit("disconnect");
    window.location.href = base_url;
  })

  if (admin == false) {
    console.log("admin is false")
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

  // const button = document.getElementById("input")
  // button.addEventListener("submit", (e) => {
  //   e.preventDefault()
  //   let message = document.getElementById("messagetext").value
  //   if (message.length != 0) {
  //     document.getElementById("messagetext").value = "";
  //     console.log(message);
  //     socket.emit("send-message", message)
  //   }
  // })


  db.collection("rooms").doc(meetingId).collection('messages').orderBy("time", "asc").onSnapshot((snapshot) => {
    document.getElementById("messages").innerHTML = ""
    snapshot.docs.map((doc) => addChat(doc.data()))
  })

  const input = document.getElementById("input")
  input.addEventListener("submit", (e) => {
    e.preventDefault()
    let message = document.getElementById("messagetext").value
    let chatname = name;
    // if(admin) chatname = `${name}:(admin)`
    // else chatname = name
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



  // socket.on("new-message", (message, Sendername) => {
  //   console.log(Sendername, " send the message ", message);
  //   addChat(Sendername, message)
  // })

  // socket.on("my-message", (message) => {
  //   console.log("You send the message ", message);
  //   addChat("You", message)
  // })

  socket.on("mute-yourself", () => {
    mute(videostream)
    document.getElementById("audio").innerHTML = '<span class="material-icons">mic_off</span>'

  })

  socket.on("off-video", () => {
    closevideo(videostream)
    document.getElementById("video").innerHTML = '<span class="material-icons">videocam_off</span>'

  })

  function addChat(object) {
    const nameele = document.createElement('div')
    const messagele = document.createElement('div')
    const chatele = document.createElement('div')
    nameele.innerHTML = `${object.name} <span>  ${object.currenttime} </span>`
    messagele.innerHTML = object.message
    nameele.classList.add('sender_name')
    messagele.classList.add('sender_message')
    chatele.append(nameele)
    chatele.append(messagele)
    document.getElementById("messages").append(chatele)
  }

  // function addChat(name, message) {
  //   const nameele = document.createElement('div')
  //   const messagele = document.createElement('div')
  //   const chatele = document.createElement('div')
  //   const d = new Date()
  //   let curhour = d.getHours()
  //   let curmin = d.getMinutes()
  //   nameele.innerHTML = `${name} <span>  ${curhour}:${curmin} </span>`
  //   messagele.innerHTML = message
  //   nameele.classList.add('sender_name')
  //   messagele.classList.add('sender_message')
  //   chatele.append(nameele)
  //   chatele.append(messagele)
  //   document.getElementById("messages").append(chatele)
  // }

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





  function constructparticipantlist(userinfo) { //console.log(userinfo)

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

  // db.collection('rooms').doc(meetingId).onSnapshot(doc=>{
  //   constructparticipantlist(doc.data().participants)
  //   console.log(doc.data().participants)
  // })
  const chatmessageswitch = document.getElementById("chatmessagediv")
  chatmessageswitch.addEventListener("click", () => {
    document.getElementById("main_app_right").classList.toggle("hide")
  })

  const presentscreen = document.getElementById('presentscreendiv');
  // presentscreendiv.addEventListener("click", presentscreenfunc);



  let presentationpeers = {};
  let presentationstream;





  async function presentscreenfunc() {

    // const mynewPeer = new Peer(undefined, {
    //   host: 'peerjs-videoclone.herokuapp.com',
    //   secure: true,
    //   port: '443'
    // })
    presenting = true;
    try {
      presentationscreen = await navigator.mediaDevices.getDisplayMedia();

    }
    catch (err) {
      console.log(console.err)
    }
    changetopresenatation();
    // navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{

    //   let videotrack = stream.getVideoTracks()[0];
    //   for (var key in connectedpeers)
    //   {
    //     let sender = connectedpeers[key].peerConnection.getSenders().find(function(s){
    //       return s.track.kind == videotrack.kind
    //     })
    //     sender.replaceTrack(videotrack)
    //   }
    //   let sender = myPeer.getSenders().find(function(s){
    //     return s.track.kind == videotrack.kind
    //   })
    //   sender.replaceTrack(videotrack)

    // console.log(stream)
    // let video1 = document.createElement('video')
    // addeventtoenlargevideo(video1)
    // addvideo(video1,stream);
    // mynewPeer.on("call",call=>{
    //   console.log("called")
    //   console.log(stream)
    //   call.answer(stream);
    //   presentationpeers[call.peer] = call;
    // })

    // })

    // navigator.mediaDevices.getDisplayMedia().then(stream1=>{

    //   let videotrack = stream1.getVideoTracks()[0];
    //   for (var key in presentationpeers)
    //   {
    //     let sender = presentationpeers[key].peerConnection.getSenders().find(function(s){
    //       return s.track.kind == videotrack.kind
    //     })
    //     sender.replaceTrack(videotrack)
    //   }

    // })





    // mynewPeer.on("open",()=>{socket.emit('join-meeting', meetingId, mynewPeer.id, `${name} (Presentation)`, profilephoto, 100)})

  }


  function changetopresenatation() {


    console.log(presentationstream)
    let videotrack = presentationstream.getVideoTracks()[0];
    for (var key in connectedpeers) {
      let sender = connectedpeers[key].peerConnection.getSenders().find(function (s) {
        return s.track.kind == videotrack.kind
      })
      sender.replaceTrack(videotrack)
    }


  }





}