const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    isActive: Boolean,
    avatar: String,
    role: Number,
    room: String
}, { timestamps: true });

/**
 * Created date
 */
userSchema.pre('save', (next) => {
    this.created = new Date();
    next();
});

const User = mongoose.model('User', userSchema);

function isUserExist(name) {
    return User.findOne({
            name: name
        })
        .select("name -_id")
        .exec(function(err, user) {
            return !!user;
        });
}

function getUsersInRoom(room) {
    return User.find({
            room: room,
            isActive: true
        })
        .select("name avatar role -_id")
        .exec(function(err, users) {
            return users;
        });
}

function checkPassword(name, password) {
    return User.findOne({
            name: name,
            password: password
        })
        .select("name room avatar role isActive -_id")
        .exec(function(err, user) {
            return user;
        });
}

function findByUsername(name) {
    return User.findOne({
            name: name
        })
        .select("name room avatar role isActive -_id")
        .exec(function(err, user) {
            return user;
        });
}

function fetch(limit, loggedIn) {
    return User.find({
            isActive: loggedIn
        })
        .select("name room avatar role -_id")
        .limit(limit || 10)
        .exec(function(err, users) {
            return users;
        });
}
function save(user) {
    var newUser = new User({
        name: user.name,
        password: user.password,
        isActive: false,
        avatar: '',
        room: user.room
    });

    return newUser.save((err, user) => {
        return user;
    });
}
function update(username, data) {
    return User.findOne({
        name: username
    }, function(err, user) {
        if(typeof data.isActive !== "undefined") {
            user.isActive = data.isActive;
        }
        if(typeof data.avatar !== "undefined") {
            user.avatar = data.avatar;
        }
        if(typeof data.room !== "undefined") {
            user.room = data.room;
        }
        user.save();
    });
}

exports.User = User;
exports.save = save;
exports.fetch = fetch;
exports.update = update;
exports.findByUsername = findByUsername;
exports.checkPassword = checkPassword;
exports.isUserExist = isUserExist;
exports.getUsersInRoom = getUsersInRoom;
exports.userNames = (function () {
    var names = {};

    var claim = (name) => {
        if (!name || names[name]) {
            return false;
        } else {
            names[name] = true;
            return true;
        }
    };

    // find the lowest unused "guest" name and claim it
    var getGuestName = () => {
        var name,
            nextUserId = 1;

        do {
            name = 'Guest ' + nextUserId;
            nextUserId += 1;
        } while (!claim(name));

        return name;
    };

    // serialize claimed names as an array
    var get = () => {
        var res = [];
        for (let user in names) {
            res.push(user);
        }

        return res;
    };

    var free = (name) => {
        if (names[name]) {
            delete names[name];
        }
    };

    return {
        claim: claim,
        free: free,
        get: get,
        getGuestName: getGuestName
    };
}());


