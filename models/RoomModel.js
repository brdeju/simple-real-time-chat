const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: String,
    private: Boolean,
    allowedUsers: Array
}, { timestamps: true });

/**
 * Created date
 */
roomSchema.pre('save', (next) => {
    this.created = new Date();
    next();
});


const Room = mongoose.model('Room', roomSchema);

function getRooms(username) {
    return Room.find({
            '$or': [
                { '$and': [{'private': true}, {'allowedUsers': username}] },
                { 'private': false }
            ]
        })
        .exec(function(err, rooms) {
            return rooms;
        });
}
function addRoom(data) {
    var newRoom = new Room(data);

    return newRoom.save((err, room) => {
        return room;
    });
}
function chackRoomByUser(room, user) {
    return Room.find({
            'name': room,
            '$or': [
                { '$and': [{'private': true}, {'allowedUsers': user}] },
                { 'private': false }
            ]
        })
        .exec(function(err, rooms) {
            return rooms;
        });
}

exports.Room = Room;
exports.fetch = getRooms;
exports.save = addRoom;
exports.chackRoomByUser = chackRoomByUser;