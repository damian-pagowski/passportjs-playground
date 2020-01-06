const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function init(passport, getUserByName, getUserById) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    getUserById(id, function(err, user) {
      done(err, user);
    });
  });

  const authenticateUser = async (username, password, done) => {
    const user = getUserByName(username);
    if (!user) {
      return done(null, false, { message: "user not found" });
    }

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
  };

  const localStrategyConfig = {
    usernameField: "username",
    passwordField: "password",
  };

  passport.use(new LocalStrategy(localStrategyConfig, authenticateUser));
}
module.exports = init;
