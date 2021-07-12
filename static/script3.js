import userobjectinfo from "./userObject.js"

// CHATROOM FOR CHATING BEFORE AFTER OR DURING THE MEETING

// Initializing the firebase app

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


let name;
let profilephoto;
let uid;
let adminuid;
let admin = false


// Check current state of the authentication
// If signed in open the chatroom else take user back to home page

firebase.auth().onAuthStateChanged((user) => {
  if (user) {

    let userobj = userobjectinfo(user)
    name = userobj.name
    profilephoto = userobj.photourl
    uid = user.uid

    db.collection('rooms').doc(meetingId).get().then(
      (result) => {
        if (result.exists) {
          document.getElementById("container_app").classList.remove("hide")
          adminuid = result.data().adminuid
          if (adminuid == uid) admin = true
          superfunction()
        }
        else {
          alert("No such meeting exist. Please check the meeting id");
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

  // Retrieving chat messages of the current room

  db.collection("rooms").doc(meetingId).collection('messages').orderBy("time", "asc").onSnapshot((snapshot) => {
    document.getElementById("messages").innerHTML = ""
    snapshot.docs.map((doc) => addchat(doc.data()))
  })

  // Function to create chat element and add it to the display
  function addchat(object) {
    const nameele = document.createElement('div')
    const messagele = document.createElement('div')
    const chatele = document.createElement('div')
    nameele.innerHTML = `${object.name} <span>  ${object.currenttime} </span>`
    messagele.innerHTML = object.message
    nameele.classList.add('sender_name')
    messagele.classList.add('sender_message')
    if (object.uid == uid) {
      nameele.style.textAlign = "left";
      messagele.style.float = "left";
    }
    chatele.append(nameele)
    chatele.append(messagele)
    document.getElementById("messages").append(chatele)
  }


  // Sending new messages -> adding new messages to the database
  const input = document.getElementById("input")
  input.addEventListener("submit", (e) => {
    e.preventDefault()
    let message = document.getElementById("messagetext").value
    let chatname = name;
    // if (admin) chatname = `${name}:(admin)`
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


  // Copy meeting info -> meeting ID, meeting url , meeting chat url

  document.getElementById("sharemeet").addEventListener("click", () => {
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


}