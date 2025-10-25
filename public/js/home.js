function attachHandlers() {
  document.querySelectorAll('.curtir-btn').forEach(btn => {
    if (btn.dataset.attached) return;
    btn.dataset.attached = '1';
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        // envia requisição para curtir (rota usada no projeto)
        const res = await fetch(`/cardapio/pratos/${id}/curtir`, { method: 'POST' });
        if (res.ok) {
          const json = await res.json();
          const contador = btn.querySelector('.contador-curtidas');
          if (json.curtidas !== undefined) contador.textContent = json.curtidas;
          if (json.liked) btn.classList.add('active'); else btn.classList.remove('active');
        } else {
          console.error('Falha ao curtir');
        }
      } catch (err) { console.error(err); }
    });
  });

  document.querySelectorAll('.comentario-form').forEach(form => {
    if (form.dataset.attached) return;
    form.dataset.attached = '1';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form.getAttribute('data-id');
      const input = form.querySelector('input[name="comentario"]');
      const texto = input.value.trim();
      if (!texto) return;
      try {
        const res = await fetch(`/cardapio/pratos/${id}/comentar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto })
        });
        if (res.ok) {
          const json = await res.json();
          const lista = document.getElementById('comentarios-' + id);
          const item = document.createElement('div');
          item.className = 'list-group-item py-2';
          item.innerHTML = '<strong class="small">' + (json.comentario.autor || 'Você') + ':</strong> <span class="small text-muted"> ' + json.comentario.texto + '</span>';
          if (lista.children.length === 1 && lista.children[0].classList.contains('text-muted')) {
            lista.innerHTML = '';
          }
          lista.prepend(item);
          input.value = '';
        } else {
          console.error('Falha ao comentar');
        }
      } catch (err) { console.error(err); }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  attachHandlers();
  const carouselEl = document.getElementById('diasCarousel');
  if (carouselEl) {
    carouselEl.addEventListener('slid.bs.carousel', () => {
      attachHandlers();
    });
  }
});
