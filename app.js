const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const passport = require("passport");
const logger = require("morgan");
require("./passport-cfg")(passport, findByName, findById);

const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const jwt = require("jsonwebtoken");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: "secretpass",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// fake db
const db = [
  {
    "username": "damian",
    "password": "$2b$10$ZbloJJ1R5Yb6t5CCcMcHOOm2ThHELxZMellJJFC9pzR4TBSM06tBm",
    "id": 0
  }
];

app.post("/register", checkNotAuthenticated, async (req, res, next) => {
  const password = "" + req.body.password;
  console.log(password);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      username: req.body.username,
      password: hashedPassword,
      id: db.length,
    };
    db.push(user);
    res.json({ message: user });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log(err);
      res.status("400").json({ errorError: info.message });
    }
    if (info != undefined) {
      console.log(info.message);
      res.status("404").json({ errorInfo: info.message });
    } else {
      req.logIn(user, err => {
        const token = jwt.sign({ id: user.id }, "secretpass");
        res.status(200).send({
          auth: true,
          token: token,
          message: "user found & logged in",
        });
      });
    }
  })(req, res, next);
});

app.get("/logout", (req, res, next) => {
  req.logOut();
  res.json({ msg: "logout-ok" });
});

app.get(
  "/",
  passport.authenticate("jwt", { failureFlash: true }),
  (req, res, next) => {
    res.json({ msg: "root-ok" });
  }
);

app.get(
  "/hello",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json(req);
  }
);

function findByName(name) {
  console.log("finding user by name:  " + name);
  const found = db.find(u => u.username == name);
  console.log("Found by name: " + found);
  return found;
}

function findById(id) {
  console.log("finding user by id:  " + id);
  const found = db.find(u => u.id == id);
  console.log("Found by id: " + JSON.stringify(found));
  return found;
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json("pls login m8 ");
  }
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.status(400).json("already authenticated");
  } else {
    next();
  }
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
