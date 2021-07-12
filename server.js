
// Importing modules

const { profile } = require('console')
const express = require('express')
const { dirname } = require('path')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')




// Serving static files

app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/front_end/styles"))
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/js'))
app.use(express.static(__dirname + '/node_modules/jquery/dist'))
app.use(express.static(__dirname + "/static"))




// Defining route paths 

app.get("/", (req, res) => {
    res.render(__dirname + "/front_end/intro_page.ejs", { newmeetingId: uuidV4() })
})


app.get('/join/:room', (req, res) => {
    res.render(__dirname + '/front_end/room.ejs', { meetingId: req.params.room })
})

app.get('/chat/:room', (req, res) => {
    res.render(__dirname + '/front_end/chatroom.ejs', { meetingId: req.params.room })
})


// Server port

var PORT = process.env.PORT || 3000
server.listen(PORT)


// userlist contains info of users currently joined in video meeting

let userlist = [];

io.on("connection", (socket) => {
    socket.on("join-meeting", (meetingId, userId, name, profilephoto, uid) => {
        socket.join(meetingId)
        
        // Adding new meeting participant info to the userlist  
        userlist.push({
            name: name,
            id: userId,
            profilephotourl: profilephoto,
            uid: uid
        })
        userlist.sort();

        // Sending message to other users that some user is connected
        socket.broadcast.to(meetingId).emit("user-connected", userId, name, profilephoto, userlist)
        socket.emit("You-are-connected", userlist)


        // Mute every participant of the meeting
        socket.on("mute-all", () => {
            socket.broadcast.to(meetingId).emit("mute-yourself");
        })


        // Disable video of every participant of the meeting
        socket.on("video-off-all", () => {
            socket.broadcast.to(meetingId).emit("off-video");
        })

        // When participant is disconnected remove participant info from the userlist 
        socket.on("disconnect", () => {

            for (let i = 0; i < userlist.length; i++) {
                if (userlist[i].name == name && userlist[i].id == userId && userlist[i].profilephotourl == profilephoto) {
                    userlist.splice(i, 1)
                    break
                }
            }

            socket.broadcast.to(meetingId).emit("user-disconnected", userId, name, profilephoto, userlist)


        })
    })


})

