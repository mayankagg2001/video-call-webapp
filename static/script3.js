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


let name;
let profilephoto;
let uid;
let adminuid;
let admin = false
firebase.auth().onAuthStateChanged((user) => {
  if (user) {

    let userobj = userobjectinfo(user)
    name = userobj.name
    profilephoto = userobj.photourl
    uid = user.uid

    db.collection('rooms').doc(meetingId).get().then(
      (result) => {
        if (result.exists) {
          // console.log("exist")
          document.getElementById("main__app").classList.remove("hide")
          adminuid = result.data().adminuid
          if (adminuid == uid) admin = true
          // console.log(admin)
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
    console.log("not signed in")
    alert("Please sign in to continue")
    window.location.href = base_url;
  }
})


function superfunction() {


  db.collection("rooms").doc(meetingId).collection('messages').orderBy("time", "asc").onSnapshot((snapshot) => {
    document.getElementById("messages").innerHTML = ""
    snapshot.docs.map((doc) => addchat(doc.data()))
  })


  function addchat(object)
  {
    const nameele = document.createElement('div')
    const messagele = document.createElement('div')
    const chatele = document.createElement('div')
    nameele.innerHTML = `${object.name} <span>  ${object.currenttime} </span>`
    messagele.innerHTML = object.message
    nameele.classList.add('sender_name')
    messagele.classList.add('sender_message')
    if(object.uid==uid)
    {
      nameele.style.textAlign = "left";
      messagele.style.float = "left";
    }
    chatele.append(nameele)
    chatele.append(messagele)
    document.getElementById("messages").append(chatele)
  }

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
    if(h<10 && m<10)
    time = `0${h}:0${m}`
    else if(h>10 && m<10)
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
        uid:uid
      })
    }
  })


  document.getElementById("sharemeet").addEventListener("click",()=>{
    const textarea = document.createElement('input')
    textarea.value = `Meeting Code : ${meetingId}
    Meeting url: ${base_url}join/${meetingId}
    Chatroom url: ${base_url}chat/${meetingId}`
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert("Meeting info successfully copied")
    // console.log(textarea)
  })


}