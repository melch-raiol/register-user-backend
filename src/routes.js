const express = require('express');
const validateBodyRequire = require('./middlewares/validateBodyRequire');
const schemaUser = require('./validation/schemaUser');

const {
    listUsers,
    registerUsers,
    login,
    updateUser,
    deleteUsers,
} = require('./controllers/users');



const routes = express();

routes.post('/user', validateBodyRequire(schemaUser), registerUsers);
routes.post('/login', login);


routes.get('/list', listUsers);
routes.put('/user/:id', validateBodyRequire(schemaUser), updateUser);
routes.delete('/user/:id', deleteUsers);

module.exports = routes;