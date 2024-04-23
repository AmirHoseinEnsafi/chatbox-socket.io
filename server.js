const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(__dirname))

let users = []
io.on('connection' , (socket) => {

    users.push(socket.id)
    socket.on('message' , ({mss , room , id}) => {
        if(room){
            if(socket.rooms.has(room)){
                return io.to(room).emit('message' , mss)
            }else return socket.emit('message' , 'you are not in the room')
        }else if(id){
            if(users.includes(id)){
                return socket.to(id).emit('message' , mss)
            }else return socket.emit('message' , 'id in not online or is not exist')
        }else return io.emit('message' , mss)
    })

    socket.on('disconnect' , () => {
        console.log(`user disconnect userId ${socket.id}`)
        const index = users.findIndex(x => x == socket.id)
        if(index != -1) users.splice(index , 1)
    })

    socket.on('join-room' , (room) => {
        socket.join(room)
        io.to(room).emit('message' , `user join the group userid ${socket.id}`)
    })

    socket.on('leave-room' , (room) => {
        socket.leave(room)
        io.to(room).emit('message' , `user left the group userid ${socket.id}`)
    })

})


const port = process.env.PORT || 3000
server.listen(port , () => console.log(`listennig on port ${port}`))