const express = require("express");
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated} = require("../config/auth.js");
// const User = require("../models/user.js");

// strona powitania
router.get("/", ensureNotAuthenticated, (req, res) => {
    res.render('welcome')
});


// strona błędu 404
router.get("/error", (req, res) => {
    ;
    res.render('404')
});


/*
// strona rejestracji
router.get("/register", ensureNotAuthenticated, (req, res) => {
    res.render('register');
});
*/

/*
// strona proba odczytu TEST
router.get("/trainers", ensureAuthenticated, async (req, res) => {
    const trainers = await User.find({type : 0});
    console.log(trainers);
    res.redirect('/');
});
*/

// panel po zalogowaniu się
router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    res.render('dashboard', {
        user : req.user
    });
});

module.exports = router; 