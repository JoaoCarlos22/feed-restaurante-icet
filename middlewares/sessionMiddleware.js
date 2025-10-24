exports.auth = async (req, res, next) => {
    try {
        if (req.session.usuario) {
            next();
        } else {
            req.session.mensagem = 'Faça login para acessar a página inicial.';
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}
