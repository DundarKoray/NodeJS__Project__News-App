const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const SALT_ROUNDS = 10

// GET

// Show articles page
/*
router.get('/',(req,res) => {
    db.any('SELECT articleid, title,body FROM articles')
    .then((articles) => {
        res.render('index',{articles: articles})
    })
}) */
router.get('/', async (req,res) => {
    let articles = await db.any('SELECT articleid, title, body FROM articles')
    res.render('index',{articles: articles})
})

// Logout page
router.get('/logout',(req,res,next) => {
    if(req.session) {
        req.session.destroy((error) => {
            if(error) {
                next(error)
            } else {
                res.redirect('/login')
            }
        })
    }
})


// Show register page
router.get('/register',(req,res) => {
    res.render('register')
})

// Show login page
router.get('/login',(req,res) => {
    res.render('login')
})





// POST

// Register
router.post('/register',(req,res) => {
    //req.body.username and req.body.password is comming from html name element in forms
    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('SELECT userid FROM users WHERE username = $1',[username])
    .then((user) => {
        if(user) {
            res.render('register',{message: "User name already exists!"})
        } else {
            // insert user into the users table
            bcrypt.hash(password,SALT_ROUNDS,function(error, hash){
                if(error == null) {
                    db.none('INSERT INTO users(username,password) VALUES($1,$2)',[username,hash])
                    .then(() => {
                    res.send('SUCCESS')
                    })
                }
            })
        }
    })
})

// Login
router.post('/login',(req,res) => {
    //req.body.username and req.body.password is comming from html name element in forms
    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('SELECT userid,username,password FROM users WHERE username = $1',[username])
    .then((user) => {
        if(user) {
            // check for user's password
            // if user exists, we check the the password is matching
            bcrypt.compare(password, user.password, function(error,result){
                if(result) {
                    // put username and userId in the session
                    if(req.session) {
                        req.session.user = {userId: user.userid, username: user.username}
                    }

                    res.redirect('/users/articles')
                }
            })
        } else {
            // user does not exist
            res.render('login', {message: 'This user does not exist! Please register first.'})
        }
    })
})


module.exports = router