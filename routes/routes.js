const UserModel = require('../models/UserModel');
const RoomModel = require('../models/RoomModel');



exports.index = function(req, res){
    var role = 1, username = '';
    if(req.user) {
        role = req.user.role;
        username = req.user.username;
    }
    res.cookie('user', JSON.stringify({
        'username': username,
        'role': role
    }));

    res.render('layout');
};

exports.logout = function(req, res){
    var username = req.session.username;
    req.session.destroy();
    res.cookie('user', '');
    UserModel.update(username, {isActive: false});
    return res.json({ status: 1 });
};

exports.login = function(req, res){
    UserModel.isUserExist(req.body.username).then( (isExists) => {
        if(!isExists) {
            return res.json({status: -1, msg: 'no user'});
        }

        UserModel.checkPassword(req.body.username, req.body.password).then( (user) => {
            if (!user) {
                return res.json({status: -1, msg: 'wrong password'});
            }

            if(!user.role) {
                user.role = 2;
            }
            req.user = user;
            res.cookie('user', JSON.stringify({
                'username': user.name,
                'role': user.role
            }));
            req.session.uid = Date.now();
            req.session.username = req.body.username;
            req.session.room = user.room;

            return res.json({ status: 1, msg: req.session.uid, user: user});
        });
    });
};

exports.signup = function(req, res){
    UserModel.isUserExist(req.body.username).then( (isExists) => {
        if(isExists) {
            return res.json({status: -1, msg: 'exists'});
        }

        UserModel.save({
            name: req.body.username,
            password: req.body.password,
            avatar: req.body.avatar,
            room: 'general',
            role: 2
        }).then( (user) => {
            if (!user) {
                return res.json({status: -1, msg: 'error'});
            }

            return res.json({ status: 1, username: user.name});
        });
    });

};

exports.createRoom = function(req, res){
    RoomModel.save({
        name: req.body.name,
        private: false,
        allowedUsers: []
    }).then( (room) => {
        if (!room) {
            return res.json({status: -1, msg: 'exists'});
        }

        return res.json({ status: 1, name: room.name});
    });
};

exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};