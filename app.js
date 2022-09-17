require('dotenv').config() //.env
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session') //passport
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const { use } = require('passport')

const app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//passport
app.use(session({
    secret: "My secert is not your secert.",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const port = 3000;
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {

});

app.post('/login', (req, res) => {

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
