# simple-real-time-chat
Simple Real Time Chat with AngularJS, Bootstrap, NodeJS, ExpressJS and Socket.io

## Requirements
* mongoDB (tested with v3.2.3)
* NodeJS (tested with v6.1.0)
* NPM (tested with v3.8.6)
* Bower (tested with v1.7.9)

## Instalation
* create .env file based on .env-sample file
    * set up data in .env file
* run mongoDB
    * create rooms: db.rooms.insert({'name': 'general', 'private': false, 'allowedUsers': ''});
    * create users: db.users.insert({'name': 'user', 'password': 'password', 'isActive': false, 'avatar': '', 'role': 2, 'room': 'general'});
* run server: node app.js (or: npm start)

## TODOS
* user sign up
* managing user profile
* creating rooms (public, private, between two users)
* 
