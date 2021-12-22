//imports:

const express = require('express');
const mongoose = require('mongoose');
const Pusher = require('pusher');
const cors = require('cors');

// import mongoData from './models/Imessage.js';
const Ichat = require('./models/Imessage.js');

const newRoute = require('./routes/new')

// app config:
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1321202",
    key: "a20c0f551fe2fa9d21c3",
    secret: "d96cc39e76236e37af2f",
    cluster: "ap2",
    useTLS: true
  });

//middleware:
app.use(cors());
app.use(express.json());

//db config:
const mongoURI = 'mongodb+srv://admin:0Veeyh1EsKMe3YD2@cluster0.ibmki.mongodb.net/ichatDB?retryWrites=true&w=majority';

mongoose.connect(mongoURI);

mongoose.connection.once('open', ()=>{
    console.log('DB connected');
    //to trigger the pusher add...
    const changeStream = mongoose.connection.collection('conversations').watch();

    changeStream.on('change', (change)=>{
        if(change.operationType === 'insert'){
            pusher.trigger('chats', 'newChat', {
                'change': change
            })
        } else if(change.operationType === 'update') {
            pusher.trigger('messages', 'newMessage',{
                'change': change
            })
        } else {
            console.log('error triggering pusher');
        }
    })
})

//api routes:
app.use('/api/new', newRoute);

app.get('/get/conversationList', (req, res)=>{
    Ichat.find((err, data)=>{
        if(err){
            res.status(500).send(err);
        } else {
            // data.sort((b, a)=> {
            //     return a.timestamp - b.timestamp;
            // });

            let conversations = [];
            data.map((conversationData)=>{
                const conversationInfo = {
                    id: conversationData._id,
                    name: conversationData.chatName,
                    timestamp: conversationData.conversation[0].timestamp,
                    
                }
                conversations.push(conversationInfo);
            })
            res.status(200).send(conversations)
        }
    })
});

//on clicking 'chat menu' in sidebar and opeining entire conversation
app.get('/get/conversation', (req, res)=> {
    const id = req.query.id;
    Ichat.find({_id: id}, (err, data) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
});

//getting the last message always on the 'chat-menu' sidebar each menu
app.get(`/get/lastMessage`, (req, res)=> {
    const id = req.query.id;

    Ichat.find({_id: id}, (err, data)=>{
        if(err){
            res.status(500).send(err);
        } else {
            //entire conversation...
            let convoData = data[0].conversation;

            convoData.sort((b, a) => {
                return a.timestamp-b.timestamp;
            });
            //sending the " last message " of conversation only
            res.status(200).send(convoData[0]);
        }
    })
})


//listening:

app.listen(port, ()=>{
    console.log(`Listening to port: ${port}`);
})