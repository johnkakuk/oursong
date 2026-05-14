const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(fileUpload());

const PORT = process.env.PORT || 8000;

const songRouter      = require('./routes/songs')
const memoryRouter    = require('./routes/memories')
const peopleRouter    = require('./routes/people')
const localSongRouter = require('./routes/localSongs')
const spotifyRouter   = require('./routes/spotify')
const authRouter      = require('./routes/auth')
require('./services/passport')

const DATABASE_URL = process.env.DATABASE_URL;

mongoose.connect(DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log("Database Connection Established"))

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(express.json())
app.use(passport.initialize())
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

app.use('/api/v1/songs',       songRouter)
app.use('/api/v1/memories',     memoryRouter)
app.use('/api/v1/people',      peopleRouter)
app.use('/api/v1/local-songs', localSongRouter)
app.use('/api/v1/spotify',    spotifyRouter)
app.use('/api/v1/auth',       authRouter)

// Look for static build
app.use(express.static(path.join(__dirname, '../reactjs/build')));

// For any routes not defined by API, assume direct request to client-side route
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../reactjs/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
