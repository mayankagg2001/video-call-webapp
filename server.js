const { profile } = require('console')
const express = require('express')
const { dirname } = require('path')
const app = express()
const server = require('http').Server(app)
const io =require('socket.io')(server)
const {v4 : uuidV4} = require('uuid')
// console.log(server)





app.set('view engine','ejs')
app.use(express.static(__dirname+"/front_end/styles"))
app.use(express.static(__dirname+'/node_modules/bootstrap/dist/css'))
app.use(express.static(__dirname+'/node_modules/bootstrap/dist/js'))
app.use(express.static(__dirname+'/node_modules/jquery/dist'))
app.use(express.static(__dirname+"/static"))




app.get("/",(req,res)=>{
    // console.log(__dirname+"/front_end/intro_page.ejs")
    res.render(__dirname + "/front_end/intro_page.ejs",{newmeetingId:uuidV4()})
})

// app.get('/join',(req,res)=>{
//     res.redirect(`/join/${uuidV4()}`);
// })

app.get('/join/:room',(req,res)=>{
    res.render(__dirname+'/front_end/room.ejs',{meetingId:req.params.room})
})

// app.post("/",(req,res)=>{
//     res.render(__dirname + "/front_end/intro_page.ejs",{newmeetingId:uuidV4()})
//     // res.send(uuidV4())
// })


server.listen(3000)

// let name = prompt("Enter your display name")

let userlist = [];

io.on("connection",(socket)=>{
    socket.on("join-meeting",(meetingId,userId,name,profilephoto,uid)=>{
        socket.join(meetingId)
        console.log(meetingId,userId)
        userlist.push({
            name:name,
            id:userId,
            profilephotourl:profilephoto,
            uid:uid
        })
        userlist.sort();
        socket.broadcast.to(meetingId).emit("user-connected",userId,name,profilephoto,userlist)
        socket.emit("You-are-connected",userlist)

        socket.on("send-message",message=>{
            socket.broadcast.to(meetingId).emit("new-message",message,name)
            socket.emit("my-message",message)
        })

        socket.on("mute-all",()=>{
            socket.broadcast.to(meetingId).emit("mute-yourself");
        })
        
        socket.on("video-off-all",()=>{
            socket.broadcast.to(meetingId).emit("off-video");
        })

        socket.on("disconnect",()=>{

            for(let i=0;i<userlist.length;i++)
            {
                if(userlist[i].name==name && userlist[i].id==userId && userlist[i].profilephotourl==profilephoto)
                {
                    // console.log(userlist[i])
                    userlist.splice(i,1)
                    break
                }
            }
            // console.log(userlist[index])
            // userlist.splice(index,1)
            socket.broadcast.to(meetingId).emit("user-disconnected",userId,name,profilephoto,userlist)
            // socket.emit("disconnect-yourself")
            
        })
    })

    
})

// io.emit("join-meeting",100,2000)