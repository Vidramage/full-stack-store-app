const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated with passport middleware with isAuthenticated method
  if(req.isAuthenticated()) {
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    req.flash('error', 'No account with that e-mail exists.');
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); //custom token
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  });
  req.flash('success', `You have been emailed a password reset link.`);
  // 4. Redirect to login page after email token was sent
  res.redirect('/login');
}

exports.reset = async (req, res) => {
  //find someone where the reset password token is equal to the req.params.token (unique token which is emailed to user), and also find if the date is greater than right now
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // if there is a user, show the reset password form
  res.render('reset', { title: 'Reset your Password' });
}

exports.confirmedPasswords = (req, res, next) => {
  //check if the confirmed passwords are the same
  if(req.body.password === req.body['password-confirm']) {
    next(); // keep it going!
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
}

exports.update = async (req, res) => {
  //check if the user is within the 1 hour token security feature
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // Update user's password by calling user.setPassword from plugin on User.js and bind it to the user
  const setPassword = promisify(user.setPassword, user);
  //set new password by passing new password with hashing, salting, and background operations
  await setPassword(req.body.password);
  //set tokens to undefined for MongoDB
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  //wait for user to reset password and save it to updatedUser
  const updatedUser = await user.save();
  //log user in automatically by passing updatedUser to login method
  await req.login(updatedUser);
  //flash user successfully reset their password
  req.flash('success', '👌 Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');
};
