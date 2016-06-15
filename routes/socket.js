const async = require('async');
const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');
const RoomModel = require('../models/RoomModel');


module.exports = function() {

    return function(socket) {
        var username, room = 'general', msgNum = 10, daysAgo = 7;

        socket.on('relead', function (data) {
            ChatModel.save({
                content: data.message,
                username: username,
                room: data.room
            }).then((res) => {
                socket.broadcast.to(room).emit('send_message', {
                    username: username,
                    createdAt: res.createdAt,
                    content: data.message
                });
            });
        });

        socket.on('send_message', function (data) {
            ChatModel.save({
                content: data.message,
                username: username,
                room: data.room
            }).then((res) => {
                socket.broadcast.to(room).emit('send_message', {
                    username: username,
                    createdAt: res.createdAt,
                    content: data.message
                });
            });
        });

        socket.on('change_room', function (data) {
            socket.broadcast.to(room).emit('user_left', {
                username: data.username,
                createdAt: new Date()
            });
            // leaving previous room
            socket.leave(room);
            room = data.room;
            // joining new one
            socket.join(room);

            async.auto(
                {
                    update: function (callback) {
                        UserModel.update(data.username, {room: data.room}).then((res) => {
                            callback(null, res);
                        });
                    },
                    messages: function (callback) {
                        ChatModel.fetch(data.room, msgNum, getDateInPast(daysAgo)).then((res) => {
                            callback(null, res);
                        });
                    },
                    users: ['update', function (results, callback) { // update function needs to be called before users
                        UserModel.getUsersInRoom(data.room).then((res) => {
                            callback(null, res);
                        });
                    }]
                },
                function (err, result) {
                    socket.emit('init', {
                        room: data.room,
                        username: data.username,
                        messages: result.messages.reverse(),
                        users: result.users
                    });
                    socket.broadcast.to(room).emit('user_join', {
                        username: data.username,
                        createdAt: new Date()
                    });
                    fn(true);
                }
            );
        });

        socket.on('authorized', function (data, fn) {
            UserModel.findByUsername(data.username).then( (user) => {
                if(!user) {
                    return fn(false);
                }

                username = data.username;
                room = user.room;
                // join room
                socket.join(room);

                async.auto(
                    {
                        update: function (callback) {
                            UserModel.update(username, {isActive: true}).then((res) => {
                                callback(null, res);
                            });
                        },
                        messages: function (callback) {
                            ChatModel.fetch(room, msgNum, getDateInPast(daysAgo)).then((res) => {
                                callback(null, res);
                            });
                        },
                        rooms: function (callback) {
                            RoomModel.fetch(username).then((res) => {
                                callback(null, res);
                            });
                        },
                        users: ['update', function (results, callback) {
                            UserModel.getUsersInRoom(room).then((res) => {
                                callback(null, res);
                            });
                        }]
                    },
                    function (err, result) {
                        socket.emit('init', {
                            username: username,
                            room: room,
                            messages: result.messages.reverse(),
                            users: result.users,
                            rooms: result.rooms
                        });
                        socket.broadcast.to(room).emit('user_join', {
                            username: username,
                            createdAt: new Date()
                        });
                        fn(true);
                    }
                )
            });
        });

        socket.on('disconnect', function (data, fn) {
            if(!data.username) {
                return ;
            }
            UserModel.update(data.username, {isActive: false});
            socket.broadcast.to(room).emit('user_left', {
                username: data.username,
                createdAt: new Date()
            });
        });


        function getDateInPast(daysAgo) {
            var now = new Date();
            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - daysAgo,
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()
            );
        }
    }
};