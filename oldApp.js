const express = require('express')
const fs = require('fs')
const path = require('path')
let starters = {
    "users": [
        {
            "name": "Terran",
            "userId": "kickflipr",
            "email": "terranadams@gmail.com",
            "age": "24"
        },
        {
            "name": "MacKayla",
            "userId": "codequeen",
            "email": "mackayla@gmail.com",
            "age": 27
        },
        {
            "name": "Sam",
            "userId": "thegenius",
            "email": "sam@gmail.com",
            "age": 26
        }
    ]
}
fs.writeFile('users.json', JSON.stringify(starters), (err, data) => {
        if (err) throw err
    })
let app = express()

app.set('views', path.join(__dirname, 'views')) // These two lines allow the fake html to be compiled to real html
app.set('view engine', 'pug')
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    
    fs.readFile('users.json', (err, data) => {
        let users = JSON.parse(data).users
        res.render('index', {users: users}) // This second object arg can be a set of variables passed into the html
    })
})

app.get('/create', (req, res) => {
    res.render('form')
})

app.post('/create', (req, res) => {
    // console.log(req.body)
    let newUser = {}
    newUser.name = req.body.name
    newUser.userId = req.body.userId
    newUser.email = req.body.email
    newUser.age = req.body.age

    fs.readFile('users.json', (err, data) => {
        var users = JSON.parse(data).users
        users.push(newUser)
        fs.writeFile('users.json', JSON.stringify({users: users}), err => {
            if (err) throw err
        })
    })
    res.redirect('/')
})

app.get('/users/:index', (req, res) => {// This lets us get data from the url
    fs.readFile('users.json', (err, data) => {
        let user = JSON.parse(data).users[req.params.index]// This is how we get the object thru the index within URL
        res.render('editForm', {user: user, index: req.params.index})
    })
})

app.post('/edit/:index', (req, res) => {
    fs.readFile('users.json', (err, data) => {
        let users = JSON.parse(data).users
        let newObject = {
            name: req.body.name,
            userId: req.body.userId,
            email: req.body.email,
            age: req.body.age
        }
        users[req.params.index] = newObject
        fs.writeFile('users.json', JSON.stringify({users: users}), err => {
            if (err) throw err
        })
        res.redirect('/')
    })
})

app.post('/delete/:index', (req, res) => {
    fs.readFile('users.json', (err, data) => {
        let users = JSON.parse(data).users
        users.splice(req.params.index, 1)
        fs.writeFile('users.json', JSON.stringify({users: users}), err => {
            if (err) throw err
        })
        res.redirect('/')
    })
})


app.listen(3000, () => {
    console.log("Listening on port 3000.")
})