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
mongoose.set('useFindAndModify', false) // We get warnings without this for some reason.
const database = mongoose.connection;
database.once("open", () => {
  console.log("Database connected");
});
// EVERYTHING ABOVE THIS LINE IS JUST BOILERPLATE
const userSchema = new mongoose.Schema({
    userID: String,
    first: String,
    last: String,
    email: String,
    age: String
})
const users = mongoose.model('users', userSchema)
// Lines 22-29 represent and define the structure of our 'users' collection.
app.get('/', (req, res) => {
    users.find({}, (err, data) => { // This callback gets our data from the database
            res.render('index', {users: data})
    })  
})   

app.post('/search', (req, res) => {
    let search = req.body.search.toLowerCase()
    users.find({}, (err, data) => {
        let filteredList = data.filter(x => {
            let first = x.first.toLowerCase()
            let last = x.last.toLowerCase()
            return first == search || last == search
        })
        res.render('index', {users: filteredList})
    })
})
 
app.get('/create', (req, res) => {
    res.render('form') // this renders the form for adding users, then runs the 'post' on line 41 when submitted.
})

app.post('/create', (req, res) => {
    const newUser = new users() // We capture the data from our form above, then save it on line 49.
    newUser.userID = req.body.userID
    newUser.first = req.body.first
    newUser.last = req.body.last
    newUser.email = req.body.email
    newUser.age = req.body.age

    newUser.save((err, data) => { // this line saves to the database, then returns you to the home screen in the callback.
        if (err) throw err
        res.redirect('/')
    })
}) 

/* The difference between the form.pug page and editForm.pug page is when we submit posts from each of them, we have 
    different app.post() functions that run based on the action they send. On form.pug, '/create' merely adds another 
    user to the DB, while the edit button for each user loads its own "editForm.pug" pre-populated with its own data.
    On that page, when we submit the post method with "/edit/ + userID", using params, the data gets captured, and 
    saves that document's new info, which uses the findOneAndUpdate() to save it to the DB.
*/
app.get('/edit/:userID', (req, res) => {
    users.findOne({userID: req.params.userID}, (err, data) => {
        res.render('editForm', {user: data}) 
    })
}) 
app.post('/edit/:userID', (req, res) => {
    // console.log(req.params.userID)
    let matchedUser = req.params.userID;
    /* we must create the custom post request on the submit button in editForm.pug and send that specific userID back
    using the params tool. The first arg is the doc to match (using params), the second is the new info to save. The third 
    argument is a callback that then re-routes you to the home page when the fineOneAndUpdate() method is finished.
    */
    users.findOneAndUpdate({ userID: matchedUser},{
    userID: req.body.userID,
    first: req.body.first,
    last: req.body.last,
    email: req.body.email,
    age: req.body.age,
    }, (err, data) => {
        if (err) throw err
        res.redirect('/')
    })
})

/* The '/delete' action doesn't need a get request because it doesn't take you to a new page...
    It does, however, require some sort of data to know which doc to run the findOneAndDelete() method on.
    That's why we use params to send back which one should be matched and deleted.
*/
app.post('/delete/:userID', (req, res) => {
    let matchedUser = req.params.userID;
    users.findOneAndDelete({ userID: matchedUser }, (err, data) => { 
        if (err) throw err
        console.log(`User removed: ${data}`)
        res.redirect('/')
    });
});

app.listen(3000, () => {
    console.log("Listening on port 3000.")
})