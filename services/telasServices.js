const pool = require('../db/connection');

exports.getCadastroUser = async (req, res) => {
    try {
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            res.render('cadastroUser', {
                mensagem: mensagem
            });
        }
        else {
            res.render('cadastroUser');
        }
    } catch (error) {
        console.error('Erro ao carregar a página de cadastro:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.getLogin = async (req, res) => {
    try {
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            res.render('login', {
                mensagem: mensagem
            });
        } else {
            res.render('login');
        }
    } catch (error) {
        console.error('Erro ao carregar a página de login:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.getHome = async (req, res) => {
    try {
        // resgata os pratos da semana da tabela cardapio
        // marca como 'prato do dia' quando o campo prato_dia for true
        const [pratos] = await pool.query('SELECT p.*, cp.dia_semana, cp.posicao FROM cardapio_prato cp JOIN prato p ON cp.prato_id = p.id WHERE cp.cardapio_id = (SELECT id FROM cardapio ORDER BY dia_inicial DESC LIMIT 1) ORDER BY FIELD(cp.dia_semana, "segunda", "terça", "quarta", "quinta", "sexta"), cp.posicao');

        res.render('home', {
            pratos: pratos
        });
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}