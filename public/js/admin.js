const precosVelas = {
  'Camomila & Mel': 25,
  'Capim-Limão': 25,
  'Baunilha Real': 25,
  'Alecrim Silvestre': 25
};

let pedidos = [];

const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const formatarData = (data) => {
  if (!data) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data)).replace('.', '');
};

const nomePagamento = {
  dinheiro: 'Dinheiro',
  credito: 'Crédito',
  debito: 'Débito',
  pix: 'Pix'
};

function agruparPedidos(reservas) {
  return Object.values(reservas.reduce((grupos, reserva) => {
    const id = reserva.pedido_id || reserva.id;
    if (!grupos[id]) {
      grupos[id] = {
        id,
        cliente: reserva.nome_cliente,
        telefone: reserva.telefone,
        pagamento: reserva.forma_pagamento,
        data: reserva.data_reserva,
        itens: [],
        total: 0,
        quantidadeTotal: 0,
        status: reserva.status || 'pendente'
      };
    }

    const quantidade = Number(reserva.quantidade) || 0;
    grupos[id].itens.push({ fragrancia: reserva.fragrancia, quantidade });
    grupos[id].total += Number(reserva.valor_final) || precosVelas[reserva.fragrancia] * quantidade;
    grupos[id].quantidadeTotal += quantidade;
    if (!grupos[id].data || new Date(reserva.data_reserva) > new Date(grupos[id].data)) {
      grupos[id].data = reserva.data_reserva;
    }
    return grupos;
  }, {}));
}

function atualizarResumo(lista) {
  document.getElementById('totalPedidos').textContent = lista.length;
  document.getElementById('totalVelas').textContent = lista.reduce((total, pedido) => total + pedido.quantidadeTotal, 0);
  document.getElementById('faturamento').textContent = formatarMoeda(lista.reduce((total, pedido) => total + pedido.total, 0));
}

function renderizarPedidos() {
  const busca = document.getElementById('busca').value.trim().toLowerCase();
  const pagamento = document.getElementById('filtroPagamento').value;
  const status = document.getElementById('filtroStatus').value;
  const filtrados = pedidos.filter((pedido) => {
    const correspondeBusca = !busca || `${pedido.cliente} ${pedido.telefone}`.toLowerCase().includes(busca);
    const correspondePagamento = pagamento === 'todos' || pedido.pagamento === pagamento;
    const correspondeStatus = status === 'todos' || pedido.status === status;
    return correspondeBusca && correspondePagamento && correspondeStatus;
  });

  atualizarResumo(filtrados);
  const pedidosElement = document.getElementById('pedidos');
  document.getElementById('status').textContent = filtrados.length
    ? `${filtrados.length} ${filtrados.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}`
    : 'Nenhum pedido corresponde aos filtros.';

  pedidosElement.innerHTML = filtrados.length ? filtrados.map((pedido, indice) => `
    <article class="order-card">
      <div class="order-number">${String(indice + 1).padStart(2, '0')}</div>
      <div class="order-main">
        <div class="order-heading">
          <div>
            <h3>${pedido.cliente || 'Cliente sem nome'}</h3>
            <p>${pedido.telefone || 'Telefone não informado'} <span class="dot">·</span> ${formatarData(pedido.data)}</p>
          </div>
          <strong class="order-total">${formatarMoeda(pedido.total)}</strong>
        </div>
        <div class="order-details">
          <div>
            <span class="detail-label">Itens</span>
            <ul>${pedido.itens.map((item) => `<li><strong>${item.quantidade}x</strong> ${item.fragrancia}</li>`).join('')}</ul>
          </div>
          <div class="payment-block">
            <span class="detail-label">Pagamento</span>
            <span class="payment-tag payment-${pedido.pagamento}">${nomePagamento[pedido.pagamento] || pedido.pagamento || 'Não informado'}</span>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-status status-${pedido.status}">${pedido.status === 'entregue' ? 'Pedido entregue' : 'Aguardando retirada'}</span>
          <button class="delivery-button" type="button" data-pedido-id="${pedido.id}" data-status="${pedido.status}">${pedido.status === 'entregue' ? 'Reabrir pedido' : 'Marcar como entregue'}</button>
        </div>
      </div>
    </article>`).join('') : '<div class="empty-state"><strong>Nada por aqui ainda.</strong><span>Altere os filtros ou aguarde novas reservas.</span></div>';

  pedidosElement.querySelectorAll('.delivery-button').forEach((botao) => {
    botao.addEventListener('click', () => atualizarStatus(botao.dataset.pedidoId, botao.dataset.status === 'entregue' ? 'pendente' : 'entregue'));
  });
}

async function atualizarStatus(pedidoId, status) {
  try {
    const resposta = await fetch(`/api/reservas/${encodeURIComponent(pedidoId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível atualizar o pedido.');
    const pedido = pedidos.find((item) => item.id === pedidoId);
    if (pedido) pedido.status = status;
    renderizarPedidos();
  } catch (erro) {
    alert(erro.message);
  }
}

async function carregarPedidos() {
  const status = document.getElementById('status');
  status.textContent = 'Carregando pedidos...';
  try {
    const resposta = await fetch('/api/reservas');
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.erro || 'Falha ao carregar pedidos.');
    pedidos = agruparPedidos(resultado);
    renderizarPedidos();
  } catch (erro) {
    status.textContent = erro.message;
    document.getElementById('pedidos').innerHTML = '<div class="empty-state error-state"><strong>Não foi possível carregar os pedidos.</strong><span>Verifique a conexão com o banco e tente atualizar.</span></div>';
    atualizarResumo([]);
  }
}

document.getElementById('busca').addEventListener('input', renderizarPedidos);
document.getElementById('filtroPagamento').addEventListener('change', renderizarPedidos);
document.getElementById('filtroStatus').addEventListener('change', renderizarPedidos);
document.getElementById('atualizarBtn').addEventListener('click', carregarPedidos);
carregarPedidos();
