/** Module dependencies. */
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const favicon = require('serve-favicon');

/** Load environment variables from .env file, where API keys and passwords are configured. */
dotenv.load({ path: '.env' });

/** Create Express server. */
const app = express();

/** Create sockets. */
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

/** Connect to MongoDB. */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
    console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

/** Configuration */
app.set('env', process.env.ENV || 'dev');
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(session({
    name: 'rtc-cookie-id',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect: true
    })
}));
app.use(favicon(__dirname + '/favicon.png'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/bower_components',  express.static(path.join(__dirname, '/bower_components'), { maxAge: 31557600000 }));
app.use('/node_modules',  express.static(path.join(__dirname, '/node_modules'), { maxAge: 31557600000 }));

/** Errors handlers */
if ('development' == app.get('env')) {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}
if ('production' == app.get('env')) {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

/** Routes */
app.get('/', routes.index);
app.post('/login', routes.login);
app.post('/logout', routes.logout);
app.post('/register', routes.signup);
app.post('/create-room', routes.createRoom);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

/** Socket.io */
const socket = require('./routes/socket')();
io.on('connection', socket);

/** Start server */
server.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});