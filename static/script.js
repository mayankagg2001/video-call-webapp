const joinnew = document.getElementById('new-meeting')
const joinexisting = document.getElementById('existing-meeting')
const joinchat = document.getElementById('existing-meeting-chat')

// joinnew.addEventListener("click",()=>{
//     window.location.href = "join";
// })


joinexisting.addEventListener("click",()=>{
    const id = document.getElementById("existing-meeting-code").value
    if(id)
    {
        window.location.href = `join/${id}`;
    }
})

joinchat.addEventListener("click",()=>{
    const id = document.getElementById("existing-meeting-code").value
    if(id)
    {
        window.location.href = `chat/${id}`;
    }
})



