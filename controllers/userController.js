const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
}

// Create a middleware that does checks on user registration
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  //check all above methods and put them into errors object
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash()
      });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

exports.register = async (req, res, next) => {
  //if we hit register it means we successfully passed last huge validation and req.body is filled with name email password, and confirm password
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.login
}

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
}

exports.updateAccount = async (req, res) => {
  //Take all the data user has sent us and update their account with it. Do not update the hash, so create seperate variable of updates
  const updates = {
    name: req.body.name,
    email: req.body.email
  };
  //Take our user model and call findOneAndUpdate, which will query for a specific user and then update that user with new data
  const user = await User.findOneAndUpdate(
    //query (userID) to identify user
    { _id: req.user._id },
    //take updates and set them to pass to DB
    { $set: updates },
    //apply options of updated user, validation steps, and pass context query which is required for mongoose to properly update
    { new: true, runValidators: true, context: 'query' }
  );
  //redirect to URL they came from (in case working on multiple endpoints we use back)
  req.flash('success', 'Updated your profile!');
  res.redirect('back');
};
