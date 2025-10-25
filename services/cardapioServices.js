const pool = require('../db/connection');

exports.telaCadPrato = async (req, res) => {
    try {
        // coleta todos os pratos do banco de dados
        const [pratos] = await pool.query('SELECT * FROM prato ORDER BY nome');

        // verifica se há mensagem na sessão para exibir na view
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            return res.render('cadastroPrato', { pratos, mensagem });
        }
        res.render('cadastroPrato', { pratos });
    } catch (error) {
        console.error('Erro ao carregar tela de cadastro de prato:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao carregar a tela de cadastro de prato.',
            erro: error,
            status: 500
        });
    }
}

exports.cadPrato = async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        if (!nome || !descricao) {
            req.session.mensagem = 'Preencha todos os campos obrigatórios.';
            return res.redirect('/prato/cadastrar');
        }
        await pool.query('INSERT INTO prato (nome, descricao) VALUES (?, ?)', [nome, descricao]);
        req.session.mensagem = 'Prato cadastrado com sucesso.';
        res.redirect('/cardapio/pratos');
    } catch (error) {
        console.error('Erro ao cadastrar prato:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao cadastrar o prato. Tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.telaCadCardapio = async (req, res) => {
    try {
        // busca todos os pratos para popular os selects na view
        const [pratos] = await pool.query('SELECT id, nome FROM prato ORDER BY nome');
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            return res.render('cadastroCardapio', { pratos, mensagem });
        }
        res.render('cadastroCardapio', { pratos });
    } catch (error) {
        console.error('Erro ao carregar tela de cadastro de cardápio:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao carregar a tela de cadastro de cardápio.',
            erro: error,
            status: 500
        });
    }
}

exports.cadCardapio = async (req, res) => {
    try {
        const payload = req.body.cardapio_json ? JSON.parse(req.body.cardapio_json) : null;
        if (!payload) {
            req.session.mensagem = 'Dados do cardápio inválidos.';
            return res.redirect('/cardapio/cadastrar');
        }

        const { dia_inicial, dia_final, itens } = payload;
        if (!dia_inicial || !dia_final || !Array.isArray(itens)) {
            req.session.mensagem = 'Preencha data inicial/final e adicione pratos.';
            return res.redirect('/cardapio/cadastrar');
        }

        if (new Date(dia_final) < new Date(dia_inicial)) {
            req.session.mensagem = 'Data final não pode ser anterior à data inicial.';
            return res.redirect('/cardapio/cadastrar');
        }

        if (itens.length === 0) {
            req.session.mensagem = 'Adicione pelo menos um prato ao cardápio.';
            return res.redirect('/cardapio/cadastrar');
        }

        const marcados = itens.filter(i => i.prato_do_dia);
        if (marcados.length > 1) {
            req.session.mensagem = 'Apenas um prato pode ser marcado como Prato do Dia.';
            return res.redirect('/cardapio/cadastrar');
        }

        // insere cardápio
        const [result] = await pool.query('INSERT INTO cardapio (dia_inicial, dia_final) VALUES (?, ?)', [dia_inicial, dia_final]);
        const cardapioId = result.insertId;

        // prepara inserts para cardapio_prato
        const values = itens.map(it => {
            // normaliza dia 'terça' -> 'terca' para casar com enum do schema, se necessário
            const diaSem = (it.dia_semana || '').replace('ç', 'c');
            return [cardapioId, it.prato_id, diaSem, it.posicao || 0];
        });

        if (values.length) {
            await pool.query('INSERT INTO cardapio_prato (cardapio_id, prato_id, dia_semana, posicao) VALUES ?', [values]);
        }

        // atualiza flag prato_dia na tabela prato (opcional, conforme regra do projeto)
        if (marcados.length === 1) {
            const pratoDoDiaId = marcados[0].prato_id;
            await pool.query('UPDATE prato SET prato_dia = 0');
            await pool.query('UPDATE prato SET prato_dia = 1 WHERE id = ?', [pratoDoDiaId]);
        }

        /* await connection.commit();
        connection.release(); */

        req.session.mensagem = 'Cardápio cadastrado com sucesso.';
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao cadastrar cardápio:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao cadastrar o cardápio. Tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.curtirPrato = async (req, res) => {
    try {
        const pratoId = req.params.id;
        if (!pratoId) {
            req.session.mensagem = 'ID do prato não fornecido.';
            return res.redirect('/');
        }

        // identifica usuário autenticado (compatível com session.userId ou session.usuarioId)
        const usuarioId = req.session.usuario.id;
        if (!usuarioId) {
            req.session.mensagem = 'Por favor, faça login para curtir o prato.';
            return res.redirect('/login');
        }

        // tenta inserir; se já existir (unique key), afectRows será 0
        const [insertResult] = await pool.query('INSERT IGNORE INTO curtida (prato_id, usuario_id) VALUES (?, ?)', [pratoId, usuarioId]);

        let liked = false;
        if (insertResult.affectedRows && insertResult.affectedRows > 0) {
            // nova curtida inserida -> incrementa contador em prato
            await pool.query('UPDATE prato SET curtidas = IFNULL(curtidas,0) + 1 WHERE id = ?', [pratoId]);
            liked = true;
        }

        // busca o total atual de curtidas
        const [rows] = await pool.query('SELECT curtidas FROM prato WHERE id = ?', [pratoId]);
        const curtidas = rows && rows[0] ? rows[0].curtidas || 0 : 0;

        return res.json({ 
            curtidas,
            liked,
            message: liked ? 'Curtida registrada.' : 'Você já curtiu este prato.' 
        });
    } catch (error) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (e) { }
        }
        console.error('Erro ao curtir prato:', error);
        return res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao curtir o prato. Tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.comentarPrato = async (req, res) => {
    try {
        const pratoId = req.params.id;
        const { texto } = req.body;

        // Verifica se o ID do prato foi fornecido
        if (!pratoId) {
            req.session.mensagem = 'ID do prato não fornecido.';
            return res.redirect('/');
        }

        // Verifica se o texto do comentário foi fornecido
        if (!texto || texto.trim() === '') {
            req.session.mensagem = 'O texto do comentário não pode ser vazio.';
            return res.redirect('/');
        }

        // Realiza o comentário do prato
        await pool.query('INSERT INTO comentario (prato_id, usuario_id, texto) VALUES (?, ?, ?)', [pratoId, req.session.usuario.id, texto.trim()]);

        const comentario = {
            autor: req.session.usuario.nome,
            texto: texto.trim()
        };

        return res.json({
            comentario,
            message: 'Comentário adicionado com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao comentar prato:', error);
        return res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao adicionar o comentário. Tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.getCurtidasData = async (req, res) => {
    try {
        // Retorna os pratos mais curtidos do cardápio mais recente (top 10)
        const [rows] = await pool.query(
            `SELECT p.id, p.nome, p.curtidas
             FROM cardapio_prato cp
             JOIN prato p ON cp.prato_id = p.id
             WHERE cp.cardapio_id = (SELECT id FROM cardapio ORDER BY dia_inicial DESC LIMIT 1)
             GROUP BY p.id
             ORDER BY p.curtidas DESC
             LIMIT 10`
        );

        // formata para o front-end: [{ nome, curtidas }, ...]
        const data = rows.map(r => ({ id: r.id, nome: r.nome, curtidas: r.curtidas || 0 }));
        res.json({ data });
    } catch (error) {
        console.error('Erro ao obter dados de curtidas:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao obter os dados de curtidas. Tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}