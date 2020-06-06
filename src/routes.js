 const express = require('express');

 const UserController = require('./app/controllers/UserController');

 const routes = express.Router();

 // Routes
 routes.post('/auth/register', UserController.create);
 routes.delete('/auth/delete_account', UserController.delete);
 routes.post('/auth/reset_password',UserController.reset);

 module.exports = routes;
