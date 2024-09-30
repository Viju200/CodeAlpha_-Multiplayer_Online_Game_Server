const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

let players = {};

// Endpoint to register a player
app.post('/register', (req, res) => {
    const { username } = req.body;
    if (players[username]) {
        return res.status(400).json({ message: 'Username already taken' });
    }
    players[username] = { username, score: 0 };
    res.status(201).json({ message: 'Player registered', player: players[username] });
});

// Real-time communication with WebSocket
io.on('connection', (socket) => {
    console.log('A player connected');

    socket.on('joinGame', (username) => {
        socket.username = username;
        socket.emit('message', `Welcome ${username}!`);
        console.log(`${username} has joined the game`);
    });

    socket.on('playerAction', (action) => {
        // Handle player actions (e.g., move, shoot)
        console.log(`${socket.username} performed an action: ${action}`);
        io.emit('update', { player: socket.username, action });
    });

    socket.on('disconnect', () => {
        console.log(`${socket.username} has disconnected`);
        delete players[socket.username];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
