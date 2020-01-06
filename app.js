const express = require("express");
const logger = require("morgan");
const app = express();
const passport = require("passport");
const initPassportConfig = require("./passport-cfg")(
  passport,
  username => db.find(u => u.username == username),
  id => db.find(u => u.id == id)
);

const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: "meo-cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// fake db
const db = [];

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

app.post(
  "/login",
  [
    checkNotAuthenticated,
    passport.authenticate("local", { failureFlash: true }),
  ],
  (req, res, next) => {
    res.json({ msg: "login-ok" });
  }
);

app.get("/logout", (req, res, next) => {
  ewq.logOut();
  res.json({ msg: "logout-ok" });
});

app.get("/", checkAuthenticated, (req, res, next) => {
  res.json({ msg: "root-ok" });
});

app.get("/hello", checkAuthenticated, (req, res, next) => {
  res.json({ msg: "hello-ok" });
});

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
