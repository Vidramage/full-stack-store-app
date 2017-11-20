const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Routes to tell us what URLs redirect to
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get('/stores/:id/edit', catchErrors(storeController.editStore))
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug))

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. Register the user
// 3. We need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

//check if user is logged in, in order to view account page
router.get('/account',
  authController.isLoggedIn,
  userController.account
);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
router.get('/map', storeController.mapPage);
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts))
router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));

router.get('/top', catchErrors(storeController.getTopStores));

/*
  API
*/

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore))
module.exports = router;


/*
Overview of Middleware path
req - user signs in with form and POSTS to /login
bodyParser - body parser makes the data available on the 'req' object.. i.e. -> req.body.email = "       mikem255@michael-mahrt.com     ";
->next();->emailNormalize is an email Normalize middleware which might prepare/validate data:

req.body.email = req.body.email.trim().toLowerCase();
req.body.email; // "mikem255@michael-mahrt.com"
->next();->authorizeUser auth middleware will lookup the user and check their password:

req.user = { name: 'Mike', email: 'mikem255@michael-mahrt.com' };

valid or invalid - if valid ->displayProfile->Ready to Render to template->res.render('account', { user: req.user })

->if invalid:
->displayLogin->req.flash('error', 'Invalid Login');
res.redirect('/login');

*/
