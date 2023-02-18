const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const PORT = 3000



// configuring your view engine
app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')

app.use(bodyParser.urlencoded({extended: false}))

app.post('/register',(req,res) => {
    let username = req.body.username
    let password = req.body.password

    console.log(username)
    console.log(password)

    res.send('REGISTER')
})

app.get('/register',(reg,res) => {
    res.render('register')
})



app.listen(PORT, () => {
    console.log(`Server has started on ${PORT}`)
})