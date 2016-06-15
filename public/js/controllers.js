'use strict';

/** Controllers */

angular.module('simpleRTC')
    .controller('ChatCtrl', ChatCtrl)
    .controller('LoginCtrl', LoginCtrl)
    .controller('LogoutCtrl', LogoutCtrl);

ChatCtrl.$inject = ['$rootScope', '$scope', 'socket', 'chatService'];
LoginCtrl.$inject = ['$rootScope', '$location', '$http', '$cookies'];
LogoutCtrl.$inject = ['$rootScope', '$location', '$http', '$cookies', 'socket'];


function ChatCtrl($rootScope, $scope, socket, chat) {
    var self = this;

    /** Scope variables */
    self.selectedRoom = '';


    /** Scope functions */

    self.sendMessage = sendMessage;
    self.changeRoom = changeRoom;

    /** init */

    socket.emit('authorized', {
        username: $rootScope.username
    });

    $scope.$on('reload-data', function($event, data) {
        init(data.room);
    });

    /** Functions definition */

    function init(room) {
        self.messages = chat.getAllMessages();
        self.rooms = chat.getAllRooms();
        self.users = chat.getAllUsers();
        self.selectedRoom = room;
    }
    function changeRoom(room) {
        self.selectedRoom = room.name;

        socket.emit('change_room', {
            username: $rootScope.username,
            room: room.name
        });
    }
    function sendMessage() {
        socket.emit('send_message', {
            message: self.message,
            username: $rootScope.username,
            room: self.selectedRoom
        });

        chat.addMessage({
            username: $rootScope.username,
            content: self.message,
            room: self.selectedRoom,
            createdAt: new Date
        });

        self.message = '';
    }

}

function LoginCtrl($rootScope, $location, $http, $cookies) {
    var self = this;

    /** Scope variables */

    self.login = '';
    self.password = '';

    /** Scope functions */

    self.loginSubmit = loginSubmit;

    /** Functions definition */

    function loginSubmit() {
        $http({
            method: "POST",
            url: "/login",
            data: {
                username: self.login,
                password: self.password
            }
        }).then(function(data) {
            if(data.data.status === 1 && data.data.msg) {

                $rootScope.isLoggedIn = true;
                $rootScope.user = data.data.user;
                $rootScope.username = data.data.user.name;
                $cookies.put('isLoggedIn', true);
                $cookies.put('username', $rootScope.username);
                $cookies.put('password', self.password);

                self.login = '';
                self.password = '';
                $location.path('/');
            }
        }, function(error) {
            console.log(error);
        });
    }
}

function LogoutCtrl($rootScope, $location, $http, $cookies, socket) {
    $http({
        method: "POST",
        url: "/logout",
        data: {}
    }).then(function(data) {
        if(data.data.status === 1) {

            $rootScope.isLoggedIn = false;
            $rootScope.user = null;
            $rootScope.username = '';
            $cookies.remove('isLoggedIn');
            $cookies.remove('username');
            $cookies.remove('password');
            $cookies.remove('user');
            $location.path('/login');

            socket.emit('disconnect', {
                username: $rootScope.username
            });
        }
    }, function(error) {
        console.log(error);
    });
}