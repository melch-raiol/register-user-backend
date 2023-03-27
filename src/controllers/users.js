const pool = require('../connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordJwt = require('../passwordJwt');
const knex = require('../connection');

const listUsers = async (req, res) => {
    try {
        const rows = await knex('users').select('*').returning('*');

        return res.status(201).json(rows);
    } catch (error) {
        return res.status(500).json('Erro interno do servidor')
    }
};

const registerUsers = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = await knex('users')
            .insert({
                name,
                email,
                password: encryptedPassword
            })
            .returning('*');

        return res.status(200).json(newUser);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json('É obrigatório email e senha');
    }

    try {
        const userEmail = await knex('users').where({ email }).first();

        if (userEmail.rowCount < 1) {
            return res.status(404).json({ message: 'Email ou password invalida' })
        }

        const validatePassword = await bcrypt.compare(password, userEmail.password)

        if (!validatePassword) {
            return res.status(400).json({ mensagem: 'Email ou password invalida' })
        }

        const token = jwt.sign({ id: userEmail.id }, passwordJwt, {
            expiresIn: '8h',
        })

        const { senha: _, ...loginedUser } = userEmail;

        return res.status(201).json({ userEmail: loginedUser, token })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const user = await knex('users')
            .update({ name, email, password })
            .where('id', id).returning('*');

        return res.status(204).json(user);
    } catch (error) {
        return res.status(500).json('Erro interno do servidor')
    }
};

const deleteUsers = async (req, res) => {
    const { id } = req.params;

    try {
        const { rows, rowCount } = await knex('users').delete().where('id', id).returning('id');

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' })
        }

        return res.status(204).send()
    } catch (error) {
        return res.status(500).json('Erro interno do servidor');
    }
};

module.exports = {
    listUsers,
    registerUsers,
    login,
    updateUser,
    deleteUsers
};