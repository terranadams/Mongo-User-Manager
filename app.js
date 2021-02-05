const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const dbConnectionString = "mongodb://localhost/MTECH";
//dbConnectionString connects to our mongo database we set up
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
mongoose.connect(dbConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = mongoose.connection;
database.once("open", () => {
  console.log("Database connected");
});

const userSchema = new mongoose.Schema({
    userID: String,
    first: String,
    last: String,
    email: String,
    age: Number
}, {
    versionKey: false // This is a mongoose tool to keep track of document changes, look it up
})
// Mongoose will look for the plural and lowercase version of the model
// so User, user, Users and users:
const users = mongoose.model('users', userSchema)

app.get('/', (req, res) => { // this callback gets our data from the database
    users.find({}, (err, data) => {
            res.render('index', {users: data})
    })
})

app.get('/create', (req, res) => {
    res.render('form')
})

app.post('/create', (req, res) => {
    const newUser = new users()
    newUser.userID = req.body.userID
    newUser.first = req.body.first
    newUser.last = req.body.last
    newUser.email = req.body.email
    newUser.age = req.body.age

    newUser.save((err, data) => { // this line saves to the database 
        if (err) throw err
        console.log(`New user save: ${data}`);
        res.redirect('/')
    })
})


app.listen(3000, () => {
    console.log("Listening on port 3000.")
})