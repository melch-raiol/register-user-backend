const jwt = require('jsonwebtoken');
const pool = require('../connection');
const passwordJwt = require('../passwordJwt');

const verifyUserAuthentication = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensagem: 'Não autorizado' });
    }

    const token = authorization.split(' ')[1]

    try {
        const { id } = jwt.verify(token, passwordJwt)

        const { rows, rowCount } = await pool.query(
            'select * from users where id = $1',
            [id]
        )

        if (rowCount < 1) {
            return res.status(401).json({ mensagem: 'Não autorizado' });
        }

        req.user = rows[0]

        next()
    } catch (error) {
        return res.status(401).json({ mensagem: 'Não autorizado' });
    }
};

module.exports = verifyUserAuthentication;
