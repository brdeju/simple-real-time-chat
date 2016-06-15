'use strict';


angular.module('simpleRTC', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'ui.bootstrap',
    'luegg.directives',
    'simpleRTC.filters',
    'simpleRTC.directives'
]);


angular.module('simpleRTC')
    .config(config)
    .run(run);

config.$inject = ['$routeProvider', '$locationProvider'];
run.$inject = ['$rootScope', '$location', '$cookies', 'socket', 'chatService'];



function config($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    // routes
    $routeProvider
        .when('/', {
            templateUrl: 'views/chat.html',
            controller: 'ChatCtrl',
            controllerAs: 'chat'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl',
            controllerAs: 'login'
        })
        .when('/logout', {
            templateUrl: 'views/logout.html',
            controller: 'LogoutCtrl',
            controllerAs: 'logout'
        })
        .otherwise({
            redirectTo: '/'
        });
}

function run($rootScope, $location, $cookies, socket, chat) {
    $rootScope.isLoggedIn = $cookies.get('isLoggedIn');
    $rootScope.username = $cookies.get('username');

    socket.on('connect', function() {
        socket.on('init', function (data) {
            if (!data.username || !data.room) {
                return;
            }
            $rootScope.username = data.username;
            $rootScope.room = data.room;

            chat.init(data.messages, data.rooms, data.users);
            $rootScope.$broadcast('reload-data', {room: data.room})
        });
        socket.on('send_message', function (message) {
            chat.addMessage(message);
        });
        socket.on('user_join', function (data) {
            chat.addMessage({
                username: 'chatroom',
                content: 'User ' + data.username + ' has joined.',
                createdAt: data.createdAt
            });
            chat.addUser({name: data.username});
        });
        socket.on('user_left', function (data) {
            chat.addMessage({
                username: 'chatroom',
                content: 'User ' + data.username + ' has left.',
                createdAt: data.createdAt
            });
            var i, user, userCnt = chat.getUsersCount();
            for (i = 0; i < userCnt; i++) {
                user = chat.getUser(i);
                if (user.name === data.username) {
                    chat.removeUser(i);
                    break;
                }
            }
        });
    });

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if(!$rootScope.isLoggedIn || !$rootScope.username) {
            return $location.path('/login');
        } else if($rootScope.isLoggedIn && next.$$route.originalPath == '/login') {
            return $location.path('/');
        }
    });
}