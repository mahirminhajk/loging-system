require('dotenv').config();//.env
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
const md5 = require('md5');//md5

const app = express()
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const port = 3000;
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
//                                          .env */
//userSchema.plugin(encrypt, { secret: process.env.SECRET_ENCRYPT, encryptedFields: ['password'] });
const User = mongoose.model('User', userSchema);

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
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((err) => {
        if (err) console.log(err);
        else res.render('secrets');
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);
    User.findOne({ email: username }, (err, foundUser) => {
        if (!err) {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets');
                } else {
                    console.log("wrong password");
                    res.redirect('/login');
                }
            } else {
                console.log("user not found");
                res.redirect('/login');
            }
        } else console.log(err);
    })
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
