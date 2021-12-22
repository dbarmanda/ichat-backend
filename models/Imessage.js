const mongoose = require("mongoose");
const imessageSchema = mongoose.Schema({
    chatName: {
        type: String
    },
    conversation: [
        {
            message: String,
            timestamp: String,
            user: {
                displayName: String,
                email: String,
                photo: String,
                uid: String
            }
        }
    ]
    
});

const Imessage = new mongoose.model('ichat', imessageSchema);

module.exports =  Imessage;