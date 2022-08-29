const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const passport = require('passport');
const {ensureAuthenticated, ensureNotAuthenticated} = require("../config/auth.js");
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');



// usuniecie zdjecia profilowego
router.post("/deletePhoto", ensureAuthenticated, (req, res) => {
    const {id} = req.user;


    const fileName = path.join(`files/img/${id}.jpg`);
    //const fileName = "../files/img/french.jpg";
    console.log(__dirname);

    fs.unlink(fileName, async (err) => {
        if(err){
            res.redirect('/users/myProfile');
            console.log(err)
        } else {
            // pobranie aktualnego użytkownika
            const myData = await User.findOne({ email : req.user.email});

            myData.isPhoto = false;

            // wywołanie zapisu
            await myData.save();

            res.redirect('/users/myProfile');
        }
    });

});

// strona wyświtlenia mojego profilu
router.get("/myProfile", ensureAuthenticated, (req, res) => {
    res.render("myProfile", {
        user : req.user
    });
});


// strona wyświtlenia wszystkich profili zawodników danego trenera
router.get("/profiles", ensureAuthenticated, async (req, res) => {

    const zawodnicy = await User.find({coach: req.user.email});

    res.render("profiles", {
        user : req.user,
        zawodnicy : zawodnicy
    });
});


// strona wyświtlenia informacji o danym zawodniku
router.get("/profile/:id", ensureAuthenticated, async (req, res) => {

    const zawodnik = await User.findById(req.params["id"]);

    // TODO jeśli zły to inny widok

    res.render("profile", {
        user : req.user,
        zawodnik : zawodnik
    });
});


// dodanie klubu lub aktualizacja
router.post("/club", ensureAuthenticated, async (req, res) => {
    // pobranie aktualnego użytkownika
    const myData = await User.findOne({ email : req.user.email});

    // aktualizacja wartości club
    myData.club = req.body.club;

    // wywołanie zapisu
    await myData.save();
    req.flash('success_msg','Zaktualizowałeś klub!');

    res.redirect('/users/myProfile');
});


// strona logowania
router.get("/login", ensureNotAuthenticated, (req, res) => {
    res.render("login");
});


// strona rejestracji
router.get("/register", ensureNotAuthenticated, async (req, res) => {
    // pobranie wszystkich trenerów
    const trainers = await User.find({type : 0});

    res.render("register", {
        triners : trainers,
        length : trainers.length
    });
});


// odpowiedz post z rejestracji
router.post("/register", ensureNotAuthenticated, async (req, res) => {
    // pobranie danych z żądania post
    const { name, email, password, password2, type, coach} = req.body;

    
    let errors = [];
    console.log(' Name ' + name+ ' email :' + email+ ' pass:' + password);

    if(!name || !email || !password || !password2) {
        errors.push({msg : "Proszę wypełnić wszystkie wymgane pola"});
    }

    if(password !== password2) {
        errors.push({msg : "Hasła nie są identyczne"});
    }

    if(password.length < 6) {
        errors.push({msg : "Hasła nie ma co najmniej 6 znaków"});
    }

    // by poprawnie ponownie wyrenderowac widok rejeestracji
    const trainers = await User.find({type : 0});

    if(errors.length > 0){
        res.render("register", {
            errors : errors,
            name : name,
            email : email,
            password : password,
            password2 : password2,
            type : type,
            coach : coach,
            triners : trainers,
            length : trainers.length
        })
    } else {
        // sprawdzenie czy można utworzyć takiego użytkownika
        User.findOne({email : email}).exec((err, user) => {
            console.log(user);
            if(user){
                errors.push({msg: 'email jest już wykorzystany'});
                res.render('register',{errors, name, email, password, password2, type, coach}) 
            } else {
                let newUser;

                if(parseInt(type) === 1) {
                    newUser = new User({
                        name : name,
                        email : email,
                        password : password,
                        type : parseInt(type),
                        coach : coach
                    });
                } else {
                    newUser = new User({
                        name : name,
                        email : email,
                        password : password,
                        type : parseInt(type),
                    });
                }
                // hashowanie hasła do zapisu w bazie
                bcrypt.genSalt(10,(err, salt)=> 
                bcrypt.hash(newUser.password, salt,
                    (err, hash)=> {
                        if(err) throw err;
                            //zapis zahashowanego hasła
                            newUser.password = hash;
                        //zapis do bazy
                        newUser.save()
                        .then((value) => {
                            console.log(value);
                            req.flash('success_msg','Stworzyłeś konto!'); // komunikacja przez flash
                            res.redirect('/users/login');
                        })
                        .catch(value => console.log(value));
                    }));
            } 
        });
    }
});


// odpowiedz post z logowania
router.post("/login", ensureNotAuthenticated, (req, res, next) => {
    passport.authenticate("local", {
        successRedirect : "/dashboard",
        failureRedirect : "/users/login",
        badRequestMessage: "Nieprawidłowe dane logowania",
        failureFlash : true,
    })(req, res, next);
});


// wylogowanie
router.get("/logout", ensureAuthenticated, (req, res) => {
    const tmp = req.user.name;
    req.logout();
    req.flash('success_msg','Zostałeś poprawnie wylogowany ' + tmp + '. Zapraszamy ponownie!');
    res.redirect('/users/login');
});


module.exports = router;