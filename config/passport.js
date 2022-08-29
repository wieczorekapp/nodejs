const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField : "email"}, (email, password, done) => {
            // pobranie użytkownika z bazy
            User.findOne({email : email})
            .then((user) => {
                if(!user){
                    return done(null,false,{message : 'Nie istnieje taki maile'});
                }

                // sprawdzenie hasła
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;

                    if(isMatch) {
                        return done(null, user)
                    } else {
                        return done(null,false,{message : 'Nieprawidłowe hasło'});
                    }
                });
            })
            .catch((err) => console.log(err));
        })
    )

    // deserializacja użytkownika do samego ID
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // pobranie użytkownika na podstawie ID
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

};