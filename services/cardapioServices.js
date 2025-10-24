const pool = require('../db/connection');

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

