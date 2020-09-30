const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const { on } = require("nodemon");
app.use(bodyParser.urlencoded({extended: true}));

//cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
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
  
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]}; //  reading cookie that we set 
  
  res.render("urls_index", templateVars);
});

//create new short url 
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]};
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
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});


// logout and clear cookie
app.post("/logout", (req, res) => {
 res.clearCookie('username');
res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// generating random number for shorturl
function generateRandomString() {
  let randomURL = Math.random().toString(20).substr(2, 6);
  return randomURL.toString();

}

