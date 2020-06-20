 const express = require('express');

 const UserController = require('./app/controllers/UserController');
 const SessionController = require('./app/controllers/SessionController');

 const routes = express.Router();

 // Routes
 routes.post('/auth/register', UserController.create);
 routes.delete('/auth/delete_account', UserController.delete);
 routes.post('/auth/first_acess', UserController.firstAcess);
 routes.post('/auth/forgot_password',UserController.forgotPassword);
 routes.post('/auth/recover_password',UserController.reset);
 routes.post('/session/authenticate',SessionController.authenticateSession); 

 module.exports = routes;
