const express = require('express')
const cors = require('cors')
const PORT = 3000


const app = express()
app.use(cors())
const server = require("http").Server(app);

const io = require('socket.io')(server,{
    cors: {
        origin: '*',
    }
})
let i=0;
io.on('connection',(socket)=>{
    console.log("a user connected:",socket.id)
    socket.on('disconnect',()=>{
        console.log('user disconnected:',socket.id)
    })
    socket.on('hi-client',(dt)=>{
        console.log("message from client:",dt)
    })
})
setInterval(()=>{
    io.emit('test-data',"hello from server"+i)
    i = i+1
    console.log("emit data to client :",i)
},1500)
//   Static assets
app.use('/', express.static(__dirname + './public'))
server.listen(PORT, () => {
    console.log('listening on *:'+PORT);
});