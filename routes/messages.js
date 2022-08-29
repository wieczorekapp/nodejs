const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Message = require("../models/message.js")

const {ensureAuthenticated, ensureNotAuthenticated} = require("../config/auth.js");


// Pobranie wszystkich wiadomości danego zawodnika
router.get("/messages", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;

    const messages = await Message.find({emailPlayer: email});

    const noReaded = messages.filter((el) => {
        return el.isRead === false;
    });

    res.render("messages/messages", {
        wiadomosci : messages,
        user : req.user,
        noReaded: noReaded.length
    });

});


// Pobranie konkretnej wiadomości danego zawodnika
router.get("/message/:id", ensureAuthenticated, async (req, res) => {

    const message = await Message.findById(req.params["id"]);

    res.render("messages/message", {
        wiadomosc : message,
        user : req.user
    });

});


// Ustawinie statusu na przeczytany w wiadomości
router.get("/confirm/:id", ensureAuthenticated, async (req, res) => {

    const message = await Message.findById(req.params["id"]);
    message.isRead = true;
    await message.save();

    res.redirect("/messages/message/" + req.params["id"]);

    /*
    res.render("messages/message", {
        wiadomosc : message,
        user : req.user
    });
    */
});


// Pobranie wszystkich wiadomości danego trenera
router.get("/coachMessages", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;

    const messages = await Message.find({emailCoach: email});

    const noReaded = messages.filter((el) => {
        return el.isRead === false;
    });

    res.render("messages/coachMessages", {
        wiadomosci : messages,
        user : req.user,
        noReaded: noReaded.length
    });

});


// Pobranie konkretnej wiadomości danego trenera
router.get("/coachMessage/:id", ensureAuthenticated, async (req, res) => {

    const message = await Message.findById(req.params["id"]);

    res.render("messages/coachMessage", {
        wiadomosc : message,
        user : req.user
    });

});


// Pobranie wszystkich wiadomości danego trenera
router.get("/coachNewMessage", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;

    const players = await User.find({coach: email});

    res.render("messages/coachNewMessage", {
        players : players,
        user : req.user,
        length : players.length
    });

});


// stworzenie nowej/nowych widomosci
router.post("/newMessage", ensureAuthenticated, async (req, res) => {

    const { title, description, emailPlayer, all_players} = req.body;

    if(all_players == 0){
        const widomosc = new Message({
            title: title,
            description: description,
            emailPlayer: emailPlayer,
            emailCoach: req.user.email
        });

        await widomosc.save();

        res.redirect("/messages/coachMessages");

    } else {
        // pobranie wszystkich zawodnikow danego trenera
        const zawodnicy = await User.find({coach: req.user.email});


        if(zawodnicy.length > 0){
            zawodnicy.forEach(async (zawodnik) => {
                let wiadomosc = new Message({
                    title: title,
                    description: description,
                    emailPlayer: zawodnik.email,
                    emailCoach: req.user.email 
                });

                await wiadomosc.save();
            })
            
            res.redirect("/messages/coachMessages");

        } else {
            res.redirect("/messages/coachMessages");
        }


    }
});


module.exports = router;