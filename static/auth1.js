var firebaseConfig = {
    apiKey: "AIzaSyB1Dcbxh_ERRibO87DChqZIpJYD-2mHdlA",
    authDomain: "video-call-app-b2276.firebaseapp.com",
    projectId: "video-call-app-b2276",
    storageBucket: "video-call-app-b2276.appspot.com",
    messagingSenderId: "449233312883",
    appId: "1:449233312883:web:a90579bb6dac30d1dc1e06"
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
        window.location.href = "https://video-app-clone.herokuapp.com/";
    }
})