require('dotenv').config() //.env
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session') //passport
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//passport
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const port = 3000;
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});
userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)
const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy())
//serialize and deserialzie from passport doc
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        //console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));


app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', (req, res) => {
    // if (req.isAuthenticated()) {
    //     res.render("secrets");
    // } else {
    //     res.redirect('/login');
    // }
    User.find({ "secret": { $ne: null } }, (err, foundUser) => {
        if (!err) {
            if (foundUser) {
                res.render("secrets", { userWithSecrets: foundUser });
            }
        } else console.log(err);
    })
});

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
})

app.post('/submit', (req, res) => {
    const submittedSecert = req.body.secret;
    User.findById(req.user.id, (err, foundUser) => {
        if (!err) {
            if (foundUser) {
                foundUser.secret = submittedSecert;
                foundUser.save((err) => {
                    if (!err) {
                        res.redirect('/secrets');
                    } else console.log(err);
                });
            }
        } else console.log(err);
    });

});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect('/');
    });
});

app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    });

});

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    //passport
    req.login(user, (err) => {
        if (err) console.log(err);
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/secrets');
            });
        }
    })

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
