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
          if (contador && json.curtidas !== undefined) contador.textContent = json.curtidas;
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
          if (lista && lista.children.length === 1 && lista.children[0].classList.contains('text-muted')) {
            lista.innerHTML = '';
          }
          if (lista) lista.prepend(item);
          input.value = '';
        } else {
          console.error('Falha ao comentar');
        }
      } catch (err) { console.error(err); }
    });
  });
}

async function loadCurtidas() {
  // verifica existência do elemento canvas antes de requisitar dados
  const canvas = document.getElementById('curtidasChart');
  if (!canvas) return; // nada a fazer se não houver canvas na página

  // garante Chart.js carregado
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js não carregado. Importe Chart.js antes de /js/home.js');
    return;
  }

  try {
    const res = await fetch('/cardapio/curtidas/data');
    if (!res.ok) return;
    const json = await res.json();
    const data = json.data || [];

    // labels e valores
    const labels = data.map(d => d.nome);
    const values = data.map(d => d.curtidas);

    const ctx = canvas.getContext('2d');
    // destrói gráfico anterior se existir (evita múltiplas instâncias ao navegar)
    if (canvas.__chartInstance) {
      canvas.__chartInstance.destroy();
      canvas.__chartInstance = null;
    }

    canvas.__chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Curtidas',
          data: values,
          backgroundColor: 'rgba(13,110,253,0.8)',
          borderColor: 'rgba(13,110,253,1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, ticks: { precision:0 } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'nearest' }
        }
      }
    });
  } catch (err) {
    console.error('Erro ao carregar dados de curtidas:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCurtidas();
  attachHandlers();
  const carouselEl = document.getElementById('diasCarousel');
  if (carouselEl) {
    carouselEl.addEventListener('slid.bs.carousel', () => {
      attachHandlers();
    });
  }
});