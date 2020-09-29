const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


let shorturl = generateRandomString(); // getting random shorturl
app.post("/urls", (req, res) => {
  
  urlDatabase[shorturl] = req.body.longURL;
  res.redirect(`/urls/${shorturl}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('req.params', req.params);
   const longurl = urlDatabase[shortURL];
   res.redirect(longurl);
  
});

app.get("/urls/:shortURL", (req,res) => {
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



function generateRandomString() {

  let randomURL = Math.random().toString(20).substr(2, 6);
  return randomURL.toString();

}