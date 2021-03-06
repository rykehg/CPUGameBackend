 const express = require('express');

 const UserController = require('./app/controllers/UserController');
 const SessionController = require('./app/controllers/SessionController');
 const authenticateMiddleware = require('./app/middlewares/auth');

 const routes = express.Router();

 // Routes
 routes.post('/auth/register', UserController.create);
 routes.delete('/auth/delete_account', authenticateMiddleware, UserController.delete);
 routes.post('/auth/first_access', UserController.firstAccess);
 routes.post('/auth/forgot_password',UserController.forgotPassword);
 routes.post('/auth/recover_password',UserController.resetPassword);
 routes.post('/session/authenticate',SessionController.authenticateSession);


 module.exports = routes;
