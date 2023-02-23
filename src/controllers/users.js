const pool = require('../connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordJwt = require('../passwordJwt');

const listUsers = async (req, res) => {
    try {
        const { rows } = await pool.query('select * from users')

        return res.json(rows)
    } catch (error) {
        return res.status(500).json('Erro interno do servidor')
    }
};

const registerUsers = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'insert into users (name, email, password) values ($1, $2, $3) returning *',
            [name, email, encryptedPassword]
        )

        return res.status(201).json(newUser.rows[0])
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' })
    }
};

const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await pool.query(
            'select * from users where email = $1',
            [email]
        )

        if (user.rowCount < 1) {
            return res.status(404).json({ message: 'Email ou password invalida' })
        }

        const validatePassword = await bcrypt.compare(password, user.rows[0].password)

        if (!validatePassword) {
            return res.status(400).json({ mensagem: 'Email ou password invalida' })
        }

        const token = jwt.sign({ id: user.rows[0].id }, passwordJwt, {
            expiresIn: '8h',
        })

        const { senha: _, ...loginedUser } = user.rows[0]

        return res.json({ user: loginedUser, token })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const { rows, rowCount } = await pool.query(
            'select * from users where id = $1',
            [id]
        );

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' })
        };

        await pool.query(
            'update users set name = $1, email = $2, password = $3 where id = $4',
            [name, email, password, id]
        );

        return res.status(204).send()
    } catch (error) {
        return res.status(500).json('Erro interno do servidor')
    }
};

const deleteUsers = async (req, res) => {
    const { id } = req.params;

    try {
        const { rows, rowCount } = await pool.query(
            'select * from users where id = $1', [id]
        )

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' })
        }

        await pool.query('delete from users where id = $1', [id])

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