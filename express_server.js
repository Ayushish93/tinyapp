const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const { on } = require("nodemon");
app.use(bodyParser.urlencoded({extended: true}));

//cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//url database
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

//user database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

//gives you json object of url
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//gives table of urls
app.get("/urls", (req, res) => {
  
   //let templateVars = { urls: urlDatabase, user_id:req.cookies['user_id'] };

  let templateVars = { urls: urlDatabase};
  for(let user in users) {
    if(user === req.cookies['user_id']) {
      templateVars['user'] = users[user];
    }
  }

  res.render("urls_index", templateVars);
});

//create new short url 
app.get("/urls/new", (req, res) => {
  //let templateVars = { user_id:req.cookies['user_id'] };
  let templateVars = {};
  for(let user in users) {
    if(user === req.cookies['user_id']) {
      templateVars['user'] = users[user];
    }
  }
  res.render("urls_new", templateVars);
});

//displays the shorturl
app.get("/urls/:shortURL", (req,res) => {
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  
  res.render("urls_show", templateVars);
});

//redirects to longurl for given shorturl
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longurl = urlDatabase[shortURL];
  res.redirect(longurl);
});

//adding new url to database and redirecting to shorturl
app.post("/urls", (req, res) => {
  let shorturl = generateRandomString(); // getting random shorturl
  urlDatabase[shorturl] = req.body.longURL;
  res.redirect(`/urls/${shorturl}`);
});

// delete short url
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//update url
app.post("/urls/:id", (req,res) => {
  let id = req.params.id;
  let newLongURL = req.body.longURL;  // user enter url;  
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

//cookie-login setting cookie value
app.post("/login", (req, res) => {
  
  let email = req.body.email;
  let password = req.body.password;      
  let id = verifyEmailPassword(email, password);
  if(id) {
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
  else {
    res.status(403).json({message: 'email/password not found'});
  }

});


// logout and clear cookie
app.post("/logout", (req, res) => {
 res.clearCookie('user_id');
 res.redirect("/urls");
});

//returns the user registraion page
app.get("/register", (req, res) => {
  let id = req.cookies['user_id'];
  let userobj = users[id];
  let templateVars = { user: userobj };
 
  res.render("user_reg",templateVars);
});

//Registring users and adding in db
app.post("/register", (req, res) => {

  let id = generateRandomString();
  res.cookie('user_id', id);      // setting cookie with id

  let email = req.body.email;
  let password = req.body.password;
  let emailExist = emailLookup(email);
  if(emailExist) {                    // checking if email exist
    res.status(400).json({message: 'email already registered'});
  }

  if(!email || !password) {           // checking if email or pass is num empty
    res.status(400).json({message: 'Bad Request no username/password provided'});
  }
  let userData = {id, email, password};
  users[id] = userData; // adding user info to db
  res.redirect("/urls");
});

// Get login page
app.get("/login", (req,res) => {
  res.render("login_form");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// generating random number for shorturl
function generateRandomString() {
  let randomURL = Math.random().toString(20).substr(2, 6);
  return randomURL.toString();

}

//function to check if email exist
function emailLookup(email) {
  for(let user in users) {
    if(users[user].email === email) {
      return true;
    }
  }
  return false;
}

// function to verify email and password
function verifyEmailPassword (email, password) {
  let id ;
  for(let user in users) {
    if(users[user].email === email && users[user].password === password) {
      id = users[user]['id'];
    }
  }
  return id;
}
