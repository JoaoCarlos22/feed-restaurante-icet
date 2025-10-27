// UI helpers
function $(sel, ctx=document) { return ctx.querySelector(sel); }
function $$(sel, ctx=document) { return Array.from(ctx.querySelectorAll(sel)); }

// Adiciona prato à lista do dia
function addPrato(dia) {
    const select = document.querySelector('select[data-dia="' + dia + '"]');
    const val = select.value;
    if (!val) return;
    const nome = select.selectedOptions[0].dataset.nome || select.selectedOptions[0].text;
    const lista = document.getElementById('lista-' + dia);

    // Remove placeholder se necessário
    if (lista.children.length === 1 && lista.children[0].classList.contains('placeholder-empty')) {
        lista.innerHTML = '';
    }

    const idx = lista.children.length;
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex align-items-center justify-content-between dish-item';
    item.draggable = true;
    item.dataset.pratoId = val;
    item.dataset.dia = dia;
    item.dataset.posicao = idx;

    // nome do input radio por dia para garantir apenas 1 selecionado por dia
    const radioName = 'prato_do_dia_item_' + dia;

    item.innerHTML = `
        <div class="d-flex align-items-center gap-3">
        <i class="bi bi-list"></i>
        <div>
            <div class="fw-semibold">${nome}</div>
            <small class="text-muted">ID: ${val}</small>
        </div>
        </div>
        <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" title="Mover para cima" onclick="moveUp(this)"><i class="bi bi-arrow-up"></i></button>
        <button type="button" class="btn btn-sm btn-outline-secondary" title="Mover para baixo" onclick="moveDown(this)"><i class="bi bi-arrow-down"></i></button>
        <button type="button" class="btn btn-sm btn-outline-danger" title="Remover" onclick="removeItem(this)"><i class="bi bi-trash"></i></button>
        <div class="form-check ms-2">
            <input class="form-check-input prato-do-dia-radio-item" type="radio" name="${radioName}" value="${val}">
        </div>
        </div>
    `;
    lista.appendChild(item);
    select.value = ''; // reset select

    // atualiza estado do toggle global do dia
    updateDayToggleState(dia);
    syncToggleToItem(dia);
}

function removeItem(btn) {
    const item = btn.closest('.list-group-item');
    const lista = item.parentElement;
    const dia = item.dataset.dia;
    item.remove();
    if (!lista.children.length) {
        lista.innerHTML = `<div class="list-group-item placeholder-empty">Nenhum prato adicionado para <strong class="text-capitalize">${lista.id.replace('lista-','')}</strong>.</div>`;
    }
    // atualiza estado do toggle do dia
    updateDayToggleState(dia);
}

function moveUp(btn) {
    const item = btn.closest('.list-group-item');
    const prev = item.previousElementSibling;
    if (prev) prev.before(item);
    // manter coerência entre toggle e items
    const dia = item.dataset.dia;
    syncToggleToItem(dia);
}

function moveDown(btn) {
    const item = btn.closest('.list-group-item');
    const next = item.nextElementSibling;
    if (next) next.after(item);
    const dia = item.dataset.dia;
    syncToggleToItem(dia);
}

// update toggle state: habilita/desabilita o checkbox do dia e limpa rádios se necessário
function updateDayToggleState(dia) {
    const lista = document.getElementById('lista-' + dia);
    const toggle = document.querySelector('.prato-do-dia-toggle[data-dia="' + dia + '"]');
    if (!lista || !toggle) return;
    const hasItems = Array.from(lista.children).some(c => !c.classList.contains('placeholder-empty'));
    toggle.disabled = !hasItems;
    if (!hasItems) {
        toggle.checked = false;
        // desmarca quaisquer rádios daquele dia
        const radios = $$('.prato-do-dia-radio-item');
        radios.forEach(r => {
        const it = r.closest('.list-group-item');
        if (it && it.dataset.dia === dia) r.checked = false;
        });
    }
}

// Se o toggle por dia estiver marcado, marca o primeiro rádio de item daquele dia; se desmarcado, desmarca itens do dia
function syncToggleToItem(dia) {
    const toggle = document.querySelector('.prato-do-dia-toggle[data-dia="' + dia + '"]');
    if (!toggle) return;
    const lista = document.getElementById('lista-' + dia);
    if (!lista) return;
    const first = Array.from(lista.children).find(c => !c.classList.contains('placeholder-empty'));
    const radioName = 'prato_do_dia_item_' + dia;
    if (toggle.checked) {
        if (first) {
        // marcar o primeiro rádio do dia
        const itemRadio = first.querySelector('.prato-do-dia-radio-item');
        if (itemRadio) {
            // o navegador já garante apenas 1 por name, então só marcar o primeiro
            itemRadio.checked = true;
        }
        } else {
        // sem itens -> não permite marcar
        toggle.checked = false;
        }
    } else {
        // desmarcou toggle -> desmarcar todos os rádios daquele dia
        const radios = document.getElementsByName(radioName);
        radios.forEach(r => r.checked = false);
    }
}

// Antes de submeter, monta JSON com estrutura:
// { dia_inicial, dia_final, itens: [ { prato_id, dia_semana, posicao, prato_do_dia: bool }, ... ] }
document.getElementById('cardapioForm').addEventListener('submit', function(e) {
    // bootstrap validation
    if (!this.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
    }

    const data = {
        dia_inicial: $('#dia_inicio').value,
        dia_final: $('#dia_final').value,
        itens: []
    };

    const dias = ['segunda','terça','quarta','quinta','sexta'];
    dias.forEach(dia => {
        const lista = document.getElementById('lista-' + dia);
        if (!lista) return;
        Array.from(lista.children).forEach((li, idx) => {
        if (li.classList.contains('placeholder-empty')) return;
        const pratoId = li.dataset.pratoId;
        const radioItem = li.querySelector('.prato-do-dia-radio-item');
        const pratoDoDia = radioItem && radioItem.checked;
        data.itens.push({
            prato_id: Number(pratoId),
            dia_semana: dia,
            posicao: idx,
            prato_do_dia: pratoDoDia
        });
        });
    });

    // se não houver itens, cancela
    if (data.itens.length === 0) {
        e.preventDefault();
        e.stopPropagation();
        alert('Adicione pelo menos um prato ao cardápio.');
        return;
    }

    // agora a regra é 1 prato_do_dia por dia. Validamos que em cada dia haja no máximo 1.
    const diasComErro = [];
    const diasList = ['segunda','terça','quarta','quinta','sexta'];
    diasList.forEach(dia => {
        const marcados = data.itens.filter(i => i.dia_semana === dia && i.prato_do_dia);
        if (marcados.length > 1) diasComErro.push(dia);
    });
    if (diasComErro.length) {
        e.preventDefault();
        e.stopPropagation();
        alert('Marque no máximo 1 prato do dia por dia. Verifique: ' + diasComErro.join(', '));
        return;
    }

    // coloca JSON no campo oculto para o servidor processar
    document.getElementById('cardapio_json').value = JSON.stringify(data);
    // formulário será enviado normalmente
});


// Eventos para sincronizar toggles por dia e rádios de item
document.addEventListener('change', function(e) {
// toggle por dia
if (e.target && e.target.classList.contains('prato-do-dia-toggle')) {
    const dia = e.target.dataset.dia;
    if (e.target.checked) {
    // marcar primeiro item do dia
    const lista = document.getElementById('lista-' + dia);
    const first = lista ? Array.from(lista.children).find(c => !c.classList.contains('placeholder-empty')) : null;
    if (first) {
        const itemRadio = first.querySelector('.prato-do-dia-radio-item');
        if (itemRadio) itemRadio.checked = true;
    } else {
        // sem itens -> não permite marcar
        e.target.checked = false;
    }
    } else {
    // desmarcou toggle -> desmarcar itens daquele dia
    const radioName = 'prato_do_dia_item_' + dia;
    const radios = document.getElementsByName(radioName);
    radios.forEach(r => r.checked = false);
    }
}

// rádio do item (por dia)
if (e.target && e.target.classList.contains('prato-do-dia-radio-item')) {
    const item = e.target.closest('.list-group-item');
    const dia = item && item.dataset.dia;
    if (!dia) return;
    const toggle = document.querySelector('.prato-do-dia-toggle[data-dia="' + dia + '"]');
    if (e.target.checked) {
    // marcar toggle do dia
    if (toggle) toggle.checked = true;
    } else {
    // se desmarcou o item, e não houver outro marcado naquele dia, desmarcar toggle
    const anyCheckedInDay = Array.from(document.getElementsByName('prato_do_dia_item_' + dia)).some(r => r.checked);
    if (!anyCheckedInDay && toggle) toggle.checked = false;
    }
}
});

// Inicialização: atualizar estado dos toggles para cada dia e sincronizar seleção existente
(function init() {
const dias = ['segunda','terça','quarta','quinta','sexta'];
dias.forEach(dia => {
    updateDayToggleState(dia);
    // se houver rádio de item já marcado no dia, marcar o toggle
    const anyChecked = Array.from(document.getElementsByName('prato_do_dia_item_' + dia || [])).some(r => r.checked);
    const toggle = document.querySelector('.prato-do-dia-toggle[data-dia="' + dia + '"]');
    if (toggle) toggle.checked = anyChecked;
});
})();