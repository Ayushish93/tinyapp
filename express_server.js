const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// helper function module
const { getUserByEmail } = require('./helpers.js');

//body parser 
const bodyParser = require("body-parser");
const { on } = require("nodemon");
app.use(bodyParser.urlencoded({extended: true}));

// cookie-session
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

//brcypt for hashing password
const bcrypt = require('bcrypt');

// url database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


// encrypting password 
const password = "123"; 
const hashedPassword = bcrypt.hashSync(password, 10);

const password1 = "purple-monkey-dinosaur";
const hashedPassword1 = bcrypt.hashSync(password1, 10);

const password2 = "dishwasher-funk";
const hashedPassword2 = bcrypt.hashSync(password2, 10);

//user database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: hashedPassword1
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: hashedPassword2
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "Ayushi@gmail.com",
    password: hashedPassword
  }
};


// generating random number for shorturl
function generateRandomString() {
  let randomURL = Math.random().toString(20).substr(2, 6);
  return randomURL.toString();

}



//function returns url for the current user
function urlsForUser(id) {
  let shortURL;
  let longURL;
  let url = {};
  for (let user in urlDatabase) {
    if (urlDatabase[user]['userID'] === id) {
      shortURL = user;
      longURL = urlDatabase[user]['longURL'];
      url[shortURL] = longURL;
    }
  }
  return url;
}

// setting up ejs engine
app.set("view engine", "ejs");

// route to login/urls page
app.get("/", (req, res) => {
  let id = req.session.user_id;
  if(id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


//gives table of urls
app.get("/urls", (req, res) => {
  
  let id = req.session.user_id;    // checking if user is login
  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj};  
  if (id) {
    let url = urlsForUser(id);
    let templateVars = { urls: url};
    for(let user in users) {
      if(user === id) {
        templateVars['user'] = users[user];
      }
    }
    res.render("urls_index", templateVars);
  }
  else {
    let msg = 'You need to Login/Register';
    templateVars['msg'] = msg;
    res.render("message",templateVars);
  }

});

//create new short url 
app.get("/urls/new", (req, res) => {

  let id = req.session.user_id; //check if user is logged in
  console.log("here is =>",id);
  if (id) {
    let templateVars = {};
    for(let user in users) {
      if(user === id) {
        templateVars['user'] = users[user];
      }
    }
    res.render("urls_new", templateVars);
  }
  else {
   res.redirect("/login");
  }

});

//displays the shorturl
app.get("/urls/:shortURL", (req,res) => {
  let id = req.session.user_id; // check if user is logged in
  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj}; 
  if (id) {
    if (urlDatabase[req.params.shortURL]) {    // check if url is present in db
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL']};
      for(let user in users) {
        if(user === id) {
          templateVars['user'] = users[user];
        }
      }
      res.render("urls_show", templateVars);
    } else {
      let msg ='URL not found';
      templateVars['msg'] = msg;
      res.render("message",templateVars);
    }
  }
  else {
    let msg ='You need to Login/Register';
    templateVars['msg'] = msg;
    res.render("message",templateVars);
  }
    
});

//redirects to longurl for given shorturl
app.get("/u/:shortURL", (req, res) => {
  let id = req.session.user_id; 
  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj}; 
  
    const shortURL = req.params.shortURL;   // check if short url is in db
    if(urlDatabase[shortURL]) {
      let longurl = urlDatabase[shortURL]['longURL'];
      res.redirect(longurl);
    }
    else {
      
      let msg = ' URL not present in database';
      templateVars['msg'] = msg;
      res.render("message",templateVars);
    }
 
});

//adding new url to database and redirecting to shorturl
app.post("/urls", (req, res) => {
  let id = req.session.user_id;
  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj}; 
  if (id) {
    let shorturl = generateRandomString(); // getting random shorturl
    urlDatabase[shorturl] = {longURL:req.body.longURL, userID:id};
    res.redirect(`/urls/${shorturl}`);
  }
  else {
    let msg = ' You need to Login/Register';
    templateVars['msg'] = msg;
    res.render("message",templateVars);
  }
});

// delete short url
app.post("/urls/:shortURL/delete", (req,res) => {
  let id = req.session.user_id;
  if (id) {
    let shortURL= req.params.shortURL;
    if (id === urlDatabase[shortURL]['userID']) {  // checking user id with the current user
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.status(403).json({message: 'URL Not Found'});
    }
     
  } else {
    res.status(403).json({message: ' You need to Login/Register'});
  }
  
});



//update url
app.post("/urls/:shortURL", (req,res) => {

  let id = req.session.user_id;
  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj};
  if(id) {
    let shortURL= req.params.shortURL;
    if (id === urlDatabase[shortURL]['userID']) {
      let shortURL = req.params.shortURL;
      let newLongURL = req.body.longURL;  // user enter url;  
      urlDatabase[shortURL].longURL = newLongURL;
      res.redirect("/urls");
    }
    else {
      let msg = "URL Not Found";
      templateVars['msg'] = msg;
      res.render("message", templateVars);
    }
  }
  else {
    let msg = "You Need To Login/Register";
    templateVars['msg'] = msg;
    res.render("message",templateVars);
  }
  
});

//cookie-login setting cookie value
app.post("/login", (req, res) => {
  
  let email = req.body.email;
  let password = req.body.password;   
  let id = getUserByEmail(email, users);  // getting userid by email  
  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj};
  if (id) {
    let passwordcheck = bcrypt.compareSync(password, users[id].password); // checking password
    if (passwordcheck) {
      req.session.user_id = id;
      res.redirect('/urls');
    }
    else {
      let msg = "Password Incorrect";
      templateVars['msg'] = msg;
      templateVars['user'] = "";
      res.render("message",templateVars);
    }
  } else {
    let msg = "Email/Password not found";
    templateVars['msg'] = msg;
    res.render("message",templateVars);
  }

});


// logout and clear cookie
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/login");
});

//returns the user registraion page
app.get("/register", (req, res) => {

  let id = req.session.user_id;
  let userobj = users[id];
  let templateVars = { user: userobj };
  res.render("user_reg",templateVars);
});

//Registring users and adding in db
app.post("/register", (req, res) => {

  
  let email = req.body.email;
  let password_nonhashed = req.body.password;
  let password = bcrypt.hashSync(password_nonhashed, 10);   //hashing password
  let id = generateRandomString();
  req.session.user_id = id;  // setting user cookie

  let userobj = users[id];  // setting template variable
  let templateVars = { user: userobj};

  
  let emailExist = getUserByEmail(email, users);
  if (emailExist) {                    // checking if email exist
    
    let msg = "Email Already exist";
    templateVars['msg'] = msg;
    res.render("message",templateVars);

  } else if (!email || !password_nonhashed) {           // checking if email or pass is num empty
      let msg = 'Bad Request no username/password provided';
      templateVars['msg'] = msg;
      res.render("message",templateVars);

  } else {
    
    let userData = {id, email, password};
    users[id] = userData; // adding user info to db
    res.redirect("/urls");
  }
  
});

// Get login page
app.get("/login", (req,res) => {
  res.render("login_form");
});

//server listening to port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



