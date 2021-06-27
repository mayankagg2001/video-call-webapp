import userobjectinfo from "./userObject.js"



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
  prompt:'select_account'
})
var db = firebase.firestore()


let Googleuser
const signinbutton = document.getElementById("signin")
const signoutbutton = document.getElementById('signout')
const newmeetingbutton = document.getElementById('new-meeting')
signinbutton.addEventListener("click",()=>{
    firebase.auth()
  .signInWithPopup(provider)
  .then((user) => {
    // console.log(user.uid)
    console.log(user)
    Googleuser = user
  }).catch((error) => {
    console.log(error)
  });
  })


  signoutbutton.addEventListener("click",()=>{
    firebase.auth().signOut().then(() => {
        console.log("sign out")
        Googleuser = null
  }).catch((error) => {
  console.log(error)
  });
  })

  firebase.auth().onAuthStateChanged((user)=>{
      if(user)
      {
          signoutbutton.style.display = "block"
          Googleuser = user;
          console.log(user)
          const {name,email,photourl,uid} = userobjectinfo(user)
          signinbutton.style.backgroundImage = `url(${photourl})`
          signinbutton.classList.add("profilephoto")
          signinbutton.innerHTML = ""
          if(newmeetingId)
          // {
          //   db.collection("rooms").add({
          //     adminuid:user.uid,
          //     meetingid:newmeetingId
          //   })
            
          //   alert(`meeting succesfully created with id ${newmeetingId}`)
          //   newmeetingId = ""
          // }
          signedin = true;
          Googleuser = user
          
      }
      else
      {     
          signoutbutton.style.display = "none"
          console.log("signedout")
          Googleuser = null
          signinbutton.classList.remove("profilephoto")
          signinbutton.style.backgroundImage = "none"
          signinbutton.innerHTML = "Sign In"
          signedin = false
          // if(newmeetingId)
          // {
          //   alert("please sign in to create new meeting")
          // }
          Googleuser = null
      }
  })
  newmeetingbutton.addEventListener("click",()=>{
    if(signedin)
    {
      if(newmeetingId)
      {
        db.collection("rooms").doc(newmeetingId).set({
          adminuid:Googleuser.uid,
          meetingid:newmeetingId
        })
        
        document.getElementById("new-meeting-id").innerHTML = `${newmeetingId}`
        document.getElementById("copy-new-meeting").classList.remove("hidden")
      }
    }
    else
    {
      document.getElementById("NotSignedIn").classList.remove("hidden")
      setTimeout(()=>{
        document.getElementById("NotSignedIn").classList.add("hidden")
      },2000)
    }
  })

  document.getElementById("copy-new-meeting").addEventListener("click",()=>{
    const textarea = document.createElement('input')
    textarea.value = newmeetingId
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    console.log(textarea)
  })