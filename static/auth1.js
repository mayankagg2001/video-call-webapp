var firebaseConfig = {
    apiKey: "AIzaSyDamobTihmwkpxxCVSb59-yUOMwpkiEoNI",
    authDomain: "video-call-app-copy.firebaseapp.com",
    projectId: "video-call-app-copy",
    storageBucket: "video-call-app-copy.appspot.com",
    messagingSenderId: "474784328760",
    appId: "1:474784328760:web:f7584e4973e0634b57cacd"
  };

  
  firebase.initializeApp(firebaseConfig);


  firebase.auth().onAuthStateChanged((user)=>{
    if(user)
    {
        console.log(user)
        document.getElementById("main__page").classList.remove("hide")
    }
    else
    {     
        console.log("not signed in")
        alert("Please sign in to continue")
        window.location.href = "https://video-meet-webapp.herokuapp.com/";
    }
})