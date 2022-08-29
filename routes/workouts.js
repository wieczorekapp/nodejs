const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Workout = require("../models/workout.js")

const {ensureAuthenticated, ensureNotAuthenticated} = require("../config/auth.js");


// Pobranie wszystkich treningów danego zawodnika
router.get("/workouts", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;

    const workouts = await Workout.find({emailPlayer: email});


    res.render("workouts/workouts", {
        workouts : workouts,
        user : req.user
    });

});


// Pobranie konkretnego treningu danego zawodnika
router.get("/workout/:id", ensureAuthenticated, async (req, res) => {

    const workout = await Workout.findById(req.params["id"]);

    res.render("workouts/workout", {
        workout : workout,
        user : req.user
    });

});


// Pobranie wszystkich treningów danego trenera
router.get("/coachWorkouts", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;

    const workouts = await Workout.find({emailCoach: email});

    res.render("workouts/coachWorkouts", {
        workouts : workouts,
        user : req.user
    });

});

// Pobranie konkretnego treningu danego trenera
router.get("/coachWorkout/:id", ensureAuthenticated, async (req, res) => {

    const workout = await Workout.findById(req.params["id"]);

    res.render("workouts/coachWorkout", {
        workout : workout,
        user : req.user
    });

});


// Wystawinie oceny i rezultatu przez trenera
router.get("/coachWorkout/:id", ensureAuthenticated, async (req, res) => {

    const workout = await Workout.findById(req.params["id"]);

    res.render("workouts/coachWorkout", {
        workout : workout,
        user : req.user
    });

});

// Wystawinie oceny i rezultatu przez trenera zapis
router.post("/coachWorkout", ensureAuthenticated, async (req, res) => {

    const {id, mark, result} = req.body;

    const workout = await Workout.findById(id);

    workout.mark = mark;
    workout.result = result;
    await workout.save();

    res.redirect("/workouts/coachWorkout/" + id);

});



// Pobranie zawodnikow danego trenera do stworzenia treningu
router.get("/coachNewWorkout", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;

    const players = await User.find({coach: email});

    res.render("workouts/coachNewWorkout", {
        players : players,
        user : req.user,
        length: players.length
    });

});


// Zapisanie nowego treningu
router.post("/coachNewWorkout", ensureAuthenticated, async (req, res) => {
    const {email} = req.user;
    const {title, description, emailPlayer} = req.body;

    console.log("title " + title + " description " + description);

    if(!title || !description){
        req.flash('error_msg','Brak tutułu lub treści!');
        res.redirect("/workouts/coachWorkouts");
    } else {

        const workout = new Workout({
            title: title,
            description: description,
            emailPlayer: emailPlayer,
            emailCoach: email
        });

        await workout.save();

        res.redirect("/workouts/coachWorkouts");
    }

});

module.exports = router;