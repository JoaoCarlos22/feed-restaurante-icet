const pool = require('../db/connection');
const bcrypt = require('bcrypt');

exports.cadastrar = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Verifica se o email já está cadastrado
        const [usuarioExistente] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (usuarioExistente.length > 0) {
            req.session.mensagem = 'Email já cadastrado.';
            return res.redirect('/login');
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere o novo usuário na tabela 'usuario'
        await pool.query('INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senhaHash]);

        req.session.mensagem = 'Cadastro realizado com sucesso! Faça login para continuar.';
        res.redirect('/login');
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (rows.length === 0) {
            req.session.mensagem = 'Email ou senha inválidos.';
            return res.redirect('/login');
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            req.session.mensagem = 'Email ou senha inválidos.';
            return res.redirect('/login');
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao processar login:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.getLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao destruir a sessão:', err);
                return res.render('paginaErro', {
                    title: 'Erro Interno do Servidor',
                    message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
                    erro: err,
                    status: err.status
                });
            }
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Erro ao processar o logout:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}