const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const bcrypt = require('bcrypt')
const expressSession = require('express-session')

const PORT = 3000
const CONNECTION_STRING = "postgres://localhost:5432/newsdb"
const SALT_ROUNDS = 10

// configuring your view engine
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.use(expressSession({
    secret: 'jkjljkj',
    resave: false,
    saveUninitialized: false
}))

app.use(bodyParser.urlencoded({extended: false}))

const db = pgp(CONNECTION_STRING)


// ARTICLES PAGE STARTS

app.get('/users/articles', (req,res) => {
    res.render('articles',{username: req.session.user.username})
})

// ARTICLES PAGE STARTS




// LOGIN PAGE STARTS
app.get('/login',(req,res) => {
    res.render('login')
})

app.post('/login',(req,res) => {
    //req.body.username and req.body.password is comming from html name element in forms
    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('SELECT userid,username,password FROM users WHERE username = $1', [username])
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
// LOGIN PAGE ENDS





// REGISTER PAGE STARTS
app.get('/register',(req,res) => {
    res.render('register')
})

app.post('/register',(req,res) => {
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
// REGISTER PAGE ENDS

app.listen(PORT,() => {
  console.log(`Server has started on ${PORT}`)
})