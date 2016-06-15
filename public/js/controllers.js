'use strict';

/** Controllers */

angular.module('simpleRTC')
    .controller('ChatCtrl', ChatCtrl)
    .controller('LoginCtrl', LoginCtrl)
    .controller('LogoutCtrl', LogoutCtrl)
    .controller('SignupCtrl', SignupCtrl)
    .controller('CreateRoomCtrl', CreateRoomCtrl);

ChatCtrl.$inject = ['$rootScope', '$scope', 'socket', 'chatService', '$uibModal'];
LoginCtrl.$inject = ['$rootScope', '$location', '$http', '$cookies'];
LogoutCtrl.$inject = ['$rootScope', '$location', '$http', '$cookies', 'socket'];
SignupCtrl.$inject = ['$rootScope', '$location', '$http', '$cookies', 'socket'];
CreateRoomCtrl.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$http', 'socket'];


function CreateRoomCtrl($rootScope, $scope, $uibModalInstance, $http, socket) {
    var self = this;

    self.roomName = '';

    self.create = function () {
        $http({
            method: "POST",
            url: "/create-room",
            data: {
                name: self.roomName
            }
        }).then(function(data) {
            if(data.data.status === 1) {
                socket.emit('authorized', {
                    username: $rootScope.username
                });

                $uibModalInstance.close();
            } else if(data.data.status === -1) {
                if(data.data.msg == 'exists') {
                    self.error = 'This name is used already';
                }
            }
        }, function(error) {
            console.log(error);
        });


    };

    self.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
function ChatCtrl($rootScope, $scope, socket, chat, modal) {
    var self = this;

    /** Scope variables */
    self.selectedRoom = '';


    /** Scope functions */

    self.sendMessage = sendMessage;
    self.changeRoom = changeRoom;
    self.createRoom = createRoom;

    /** init */

    socket.emit('authorized', {
        username: $rootScope.username
    });

    $scope.$on('reload-data', function($event, data) {
        console.log('reload-data');
        init(data.room);
    });

    /** Functions definition */

    function init(room) {
        self.messages = chat.getAllMessages();
        self.rooms = chat.getAllRooms();
        self.users = chat.getAllUsers();
        self.selectedRoom = room;
    }
    function createRoom() {
        var modalInstance = modal.open({
            animation: true,
            templateUrl: 'views/partials/createRoomModal.html',
            controller: 'CreateRoomCtrl',
            controllerAs: 'room',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
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
    self.error = '';

    /** Scope functions */

    self.loginSubmit = loginSubmit;

    /** Functions definition */

    function loginSubmit() {
        $http({
            method: "POST",
            url: "/login",
            data: {
                username: self.login,
                password: sha256(self.password)
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
            } else if(data.data.status === -1) {
                if(data.data.msg == 'no user') {
                    self.error = 'There\'s no such user';
                } else if(data.data.msg == 'wrong password') {
                    self.error = 'Password is wrong';
                }
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

function SignupCtrl($rootScope, $location, $http, $cookies, socket) {
    var self = this;


    self.signupSubmit = signupSubmit;

    init();


    function init() {
        self.username = '';
        self.password = '';
        self.rpassword = '';
        self.avatar = '';
        self.error = '';
    }
    function signupSubmit() {
        if(self.password !== self.rpassword) {
            self.error = 'Passwords don\'t match';
            return ;
        }
        $http({
            method: "POST",
            url: "/register",
            data: {
                username: self.username,
                password: sha256(self.password),
                avatar: self.avatar
            }
        }).then(function(data) {
            if(data.data.status === 1) {
                init();
                $location.path('/login');
            } else if(data.data.status === -1) {
                if(data.data.msg == 'exists') {
                    self.error = 'User name exists';
                }
            }
        }, function(error) {
            console.log(error);
        });
    }
}