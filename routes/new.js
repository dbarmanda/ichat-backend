const express = require('express');

const Ichat = require('../models/Imessage.js');

const router = express.Router();

router.post("/chat", (req, res)=> {
    const newChat = req.body;
    Ichat.create(newChat, (err, data)=>{
        if(err){
            res.status(500).send(err.message);
        } else {
            res.status(200).send(data);
        }
    })
});

router.post('/message', (req, res)=>{
    Ichat.update(
        {_id: req.query.id},
        {$push: {conversation: req.body} },
        (err, data)=> {
            if(err){
                console.log("hello");
                res.status(500).send(err);
            } else {
                console.log('message sent');
                res.status(200).send(data);
            }
        }
    )
})


module.exports = router;
