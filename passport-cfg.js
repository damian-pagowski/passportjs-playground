const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var optsJwt = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secretpass";

function initPassportConfig(passport, getUserByName, getUserById) {
  const authenticateUser = async (username, password, done) => {
    const user = getUserByName(username);
    console.log("username: " + username + " User found: " + user);
    if (!user) {
      return done(null, false, { message: "user not found" });
    } else {
      try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return done(null, user);
        } else {
          return done(null, false, { message: "invalid password" });
        }
      } catch (error) {
        return done(error);
      }
    }
  };

  const optsLocal = {
    usernameField: "username",
    passwordField: "password",
  };

  passport.use("local", new LocalStrategy(optsLocal, authenticateUser));

  function awtAuthCallback(jwt_payload, done) {
    const id = jwt_payload.id;
    console.log("inside jwt handler - id " + id);
    const user = getUserById(id);
    return done(null, user);
  }

  passport.use("jwt", new JwtStrategy(optsJwt, awtAuthCallback));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    getUserById(id, function(err, user) {
      done(err, user);
    });
  });
}
module.exports = initPassportConfig;
