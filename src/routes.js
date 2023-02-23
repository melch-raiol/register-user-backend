const express = require('express');

const {
    listUsers,
    registerUsers,
    login,
    //detailUsers,
    updateUser,
    deleteUsers,
} = require('./controllers/users');

const verifyUserAuthentication = require('./intermediaries/authentication');

const routes = express();

routes.post('/user', registerUsers);
routes.post('/login', login);

routes.use(verifyUserAuthentication);

routes.get('/user', listUsers);
routes.put('/user/:id', updateUser);
routes.delete('/user/:id', deleteUsers);

module.exports = routes;