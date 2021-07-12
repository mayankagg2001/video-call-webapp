import userobjectinfo from "./userObject.js"

// Initialized the firebase webapp and using it for google authentication as well as firestore database

var firebaseConfig = {
  apiKey: "AIzaSyDamobTihmwkpxxCVSb59-yUOMwpkiEoNI",
  authDomain: "video-call-app-copy.firebaseapp.com",
  projectId: "video-call-app-copy",
  storageBucket: "video-call-app-copy.appspot.com",
  messagingSenderId: "474784328760",
  appId: "1:474784328760:web:f7584e4973e0634b57cacd"
};



let signedin = false;
firebase.initializeApp(firebaseConfig);

var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
})
var db = firebase.firestore()


// Googleuser store the info of signed in user if signed in else null

let Googleuser
const signinbutton = document.getElementById("signin")
const signoutbutton = document.getElementById('signout')
const newmeetingbutton = document.getElementById('new-meeting')
const joinexisting = document.getElementById('existing-meeting')
const joinchat = document.getElementById('existing-meeting-chat')

// Handling google sign in event

signinbutton.addEventListener("click", () => {
  firebase.auth()
    .signInWithPopup(provider)
    .then((user) => {

      Googleuser = user
    }).catch((error) => {
      console.log(error)
    });
})


// Handling google sign out event

signoutbutton.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {

    Googleuser = null
  }).catch((error) => {
    console.log(error)
  });
})


// Handling google authentication state change event ie if we signed in with some other account or signed out 

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    signoutbutton.style.display = "block"
    Googleuser = user;

    const { name, email, photourl, uid } = userobjectinfo(user)
    signinbutton.style.backgroundImage = `url(${photourl})`
    signinbutton.classList.remove("signupbutton")
    signinbutton.classList.add("profilephoto")
    signinbutton.innerHTML = ""
    if (newmeetingId)
      signedin = true;
    Googleuser = user

  }
  else {
    signoutbutton.style.display = "none"

    Googleuser = null
    signinbutton.classList.remove("profilephoto")
    signinbutton.classList.add("signupbutton")
    signinbutton.style.backgroundImage = "none"
    signinbutton.innerHTML = "Sign In"
    signedin = false
    Googleuser = null
  }
})

// Create new meeting event - > if Signed in user is able to create a new meeting and meeting Id will be displayed on the screen 
//                              and it will be added to the database so that the meeting can be accessed
//                              else it will ask you to first sign in 

newmeetingbutton.addEventListener("click", () => {
  if (signedin) {
    if (newmeetingId) {
      db.collection("rooms").doc(newmeetingId).set({
        adminuid: Googleuser.uid,
        meetingid: newmeetingId
      })

      document.getElementById("new-meeting-id").innerHTML = `${newmeetingId}`
      document.getElementById("copy-new-meeting").classList.remove("hidden")
    }
  }
  else {
    document.getElementById("NotSignedIn").classList.remove("hidden")
    setTimeout(() => {
      document.getElementById("NotSignedIn").classList.add("hidden")
    }, 2000)
  }
})






// join-existing-meeting , join-existing-chat ->if signed in go to that meeting or chtroom else ask the user to first sign in 


joinexisting.addEventListener("click", () => {
  if(signedin)
  {
    const id = document.getElementById("existing-meeting-code").value
    if (id) {
        window.location.href = `join/${id}`;
    }
  }
  else {
    document.getElementById("NotSignedIn").classList.remove("hidden")
    setTimeout(() => {
      document.getElementById("NotSignedIn").classList.add("hidden")
    }, 2000)
  }
})

joinchat.addEventListener("click", () => {
  if(signedin)
  {
    const id = document.getElementById("existing-meeting-code").value
    if (id) {
        window.location.href = `chat/${id}`;
    }
  }
  else {
    document.getElementById("NotSignedIn").classList.remove("hidden")
    setTimeout(() => {
      document.getElementById("NotSignedIn").classList.add("hidden")
    }, 2000)
  }
})



// Copy button which will be used to copy meeting Id after new meeting is created

document.getElementById("copy-new-meeting").addEventListener("click", () => {
  const textarea = document.createElement('input')
  textarea.value = newmeetingId
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)

})