 const express = require('express');

 const UserController = require('./app/controllers/UserController');

 const routes = express.Router();
 
 // Routes
 routes.post('/auth/register', UserController.create);
 routes.delete('/auth/delete_account', UserController.delete);

 module.exports = routes;
