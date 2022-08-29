const express = require("express"); // import framworka do obsługi żądań http
//const router = express.Router(); // wykorzystanie modułu routingu
const app = express(); // stwaorzenie instancji aplikacji
const mongoose = require("mongoose"); // importowanie ORM dla MongoDb
const expressEjsLayout = require('express-ejs-layouts'); // import template engine
const flash = require('connect-flash'); // moduł wkorzystywany do przekazywania komunikatów pomiędzy żądaniami kolejnymi
const session = require('express-session'); // moduł zarzadzający sesją
const passport = require('passport'); // moduł odpowiedzialny za autentykacje użytkownika
const path = require('path'); // moduł pozwalający na łątwy dostęp do static file
const favicon = require('serve-favicon'); // moduł umożliwijący wyświeltlenie favicon

const multer  = require('multer'); // moduł służący do uploadu plików
const fs = require('fs'); // moduł służący do maniupulacji systemem plików

const {urlencoded} = require("express");  // dekodowanie url

const User = require("./models/user.js");
const {ensureAuthenticated, ensureNotAuthenticated} = require("./config/auth.js");


// ważne by wywołać na samym początku, umożliwa odczytywanie zmiennych środowiskowych/.env
require('dotenv').config();


// konfiguracja parametrów pracy passport
require("./config/passport")(passport);

  
// konfiguracja polaczenia z mongodb
mongoose.connect(process.env.DB_CONN, {useNewUrlParser: true, useUnifiedTopology : true})
    .then(() => console.log("connected to mongodb"))
    .catch((err) => console.log(err));


// konfiguracja EJS, używango w projekcie Template Engine
app.set("view engine", "ejs");
app.use(expressEjsLayout);


// ustawinie wyseitlenia favicon
app.use(favicon(path.join(__dirname, 'files', 'favicon.ico')));


// konfiguracja body parsera, odczytuje zakodowane postacie url
app.use(urlencoded({extended: false}));


// konfiguracja wykorzystania mechanizmu sesji do logownia
app.use(session({
    secret : process.env.SECRET,
    resave : true,
    saveUninitialized : true
}));


// dodanie obsługi sesji z passport
app.use(passport.initialize());
app.use(passport.session());


// wykorzystanie flasha do komunikatów
app.use(flash());
app.use((req, res ,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
});


// dostęp do zasobów statycznych
app.use(express.static(path.join(__dirname, '/files')));


// ================================================================================================
// parametry uploadu plików
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './files/img')
    },
    filename: function (req, file, cb) {

        const {id} = req.user;
        const fileName = `${id}.jpg`;

        cb(null, fileName)
    }
})
  
const upload = multer({ storage: storage })

// dodanie zdjecia profilowego
app.post("/addPhoto", ensureAuthenticated, upload.single("photo"), async (req, res) => {
    // pobranie aktualnego użytkownika
    const myData = await User.findOne({ email : req.user.email});

    // aktualizacja wartości club
    myData.isPhoto = true;

    // wywołanie zapisu
    await myData.save()

    res.redirect('/users/myProfile');  
});
// ================================================================================================


// główny routing w aplikacji
app.use("/", require("./routes/index.js"));
app.use("/users", require("./routes/users.js"));
app.use("/workouts", require("./routes/workouts.js"));
app.use("/messages", require("./routes/messages.js"));


// obsługa nieznanych żądań przy braku zalogowania
app.use(ensureNotAuthenticated, function(req, res) {
    res.redirect('/error');
});
 
// obsługa nieznanych żądań przy zalogowaniu
app.use( function(req, res) {
    res.redirect('/dashboard');
});


// uruchominie aplikacji na porcie 3000
app.listen(3000, () => {
    console.log("Application working on port 3000");
});