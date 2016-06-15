'use strict';

/* Services */

angular.module('simpleRTC')
    .factory('socket', initSocket)
    .factory('chatService', chatService);


initSocket.$inject = ['$rootScope'];
chatService.$inject = ['$rootScope'];



function initSocket($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}

function chatService() {
    var messages = [];
    var rooms = [];
    var users = [];

    return {
        init: init,
        getUser: getUser,
        addUser: addUser,
        removeUser: removeUser,
        getUsersCount: getUsersCount,
        getAllUsers: getAllUsers,
        getMessage: getMessage,
        addMessage: addMessage,
        removeMessage: removeMessage,
        getMessagesCount: getMessagesCount,
        getAllMessages: getAllMessages,
        getRoom: getRoom,
        addRoom: addRoom,
        removeRoom: removeRoom,
        getRoomsCount: getRoomsCount,
        getAllRooms: getAllRooms
    };

    function init(_messages, _rooms, _users) {
        if(typeof _messages !== "undefined") {
            messages = _messages;
        }
        if(typeof _rooms !== "undefined") {
            rooms = _rooms;
        }
        if(typeof _users !== "undefined") {
            users = _users;
        }
    }

    function addUser(user) {
        users.push(user);
    }
    function getUser(index) {
        return users[index];
    }
    function removeUser(index) {
        users.splice(index, 1)
    }
    function getUsersCount() {
        return users.length;
    }
    function getAllUsers() {
        return users;
    }
    function addMessage(message) {
        messages.push(message);
    }
    function getMessage(index) {
        return messages[index];
    }
    function removeMessage(index) {
        messages.splice(index, 1)
    }
    function getMessagesCount() {
        return messages.length;
    }
    function getAllMessages() {
        return messages;
    }
    function addRoom(room) {
        rooms.push(room);
    }
    function getRoom(index) {
        return rooms[index];
    }
    function removeRoom(index) {
        rooms.splice(index, 1)
    }
    function getRoomsCount() {
        return rooms.length;
    }
    function getAllRooms() {
        return rooms;
    }
}