const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    content: String,
    username: String,
    room: String
}, { timestamps: true });

/**
 * Created date
 */
chatSchema.pre('save', (next) => {
    this.created = new Date();
    next();
});

const Chat = mongoose.model('Chat', chatSchema);

function fetch(room, limit, startDate) {
    return Chat.find({
            room: room,
            createdAt: {"$gte": startDate}
        })
        .sort({'createdAt': -1})
        .limit(limit || 10)
        .exec(function(err, messages) {
            return messages;
        });
}
function save(msg) {
    var newMsg = new Chat({
        content: msg.content,
        username: msg.username,
        room: msg.room.toLowerCase()
    });

    return newMsg.save((err, msg) => {
        return msg;
    });
}

exports.Chat = Chat;
exports.fetch = fetch;
exports.save = save;