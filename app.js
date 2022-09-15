require('dotenv').config();//.env
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const app = express()
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://127.0.0.1:27017/userDB');
const saltRounds = 10;//bcrypt

const port = 3000;
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
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

    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (!err) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
        } else console.log(err);

        newUser.save((err) => {
            if (err) console.log(err);
            else res.render('secrets');
        });
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, (err, foundUser) => {
        if (!err) {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, (err, result) => {
                    if (!err) {
                        if (result) {
                            res.render('secrets');
                        } else {
                            console.log("wrong password");
                            res.redirect('/login');
                        }
                    } else console.log(err);
                })
            } else {
                console.log("user not found");
                res.redirect('/login');
            }
        } else console.log(err);
    })
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
