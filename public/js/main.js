const precosVelas = {
  'Camomila & Mel': 25,
  'Capim-Limão': 25,
  'Baunilha Real': 25,
  'Alecrim Silvestre': 25
};

const itensReserva = [];

function adicionarVela(nomeFragrancia) {
  document.getElementById('fragrancia').value = nomeFragrancia;
  document.getElementById('quantidade').value = 1;
  document.getElementById('adicionarVelaBtn').click();
  document.getElementById('area-reserva').scrollIntoView({ behavior: 'smooth' });
}

function atualizarResumoReserva() {
  const lista = document.getElementById('itensReserva');
  const total = itensReserva.reduce((soma, item) => soma + precosVelas[item.fragrancia] * item.quantidade, 0);

  lista.innerHTML = itensReserva.length
    ? itensReserva.map((item, indice) => `
      <div class="reservation-item">
        <span>${item.fragrancia} (${item.quantidade}x)</span>
        <strong>R$ ${(precosVelas[item.fragrancia] * item.quantidade).toFixed(2).replace('.', ',')}</strong>
        <button type="button" class="remove-item" data-indice="${indice}" aria-label="Remover ${item.fragrancia}">Remover</button>
      </div>`).join('')
    : '<p class="empty-items">Nenhuma vela adicionada ainda.</p>';

  document.getElementById('valorTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  lista.querySelectorAll('.remove-item').forEach((botao) => {
    botao.addEventListener('click', () => {
      itensReserva.splice(Number(botao.dataset.indice), 1);
      atualizarResumoReserva();
    });
  });
}

document.getElementById('adicionarVelaBtn').addEventListener('click', () => {
  const fragrancia = document.getElementById('fragrancia').value;
  const quantidade = Number(document.getElementById('quantidade').value);

  if (!fragrancia || !Number.isInteger(quantidade) || quantidade < 1) {
    alert('Selecione uma fragrância e informe uma quantidade válida.');
    return;
  }

  const itemExistente = itensReserva.find((item) => item.fragrancia === fragrancia);
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    itensReserva.push({ fragrancia, quantidade });
  }

  atualizarResumoReserva();
});

document.getElementById('reservaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  // Validação rápida de tamanho antes do envio
  if (nome.length < 3) {
    alert('Por favor, informe um nome válido com pelo menos 3 letras.');
    return;
  }

  if (telefone.length < 14) {
    alert('Por favor, digite um número de telefone completo com DDD.');
    return;
  }

  if (itensReserva.length === 0) {
    alert('Adicione pelo menos uma vela à reserva.');
    return;
  }

  const dadosReserva = {
    nome_cliente: nome,
    telefone: telefone,
    itens: itensReserva,
    forma_pagamento: document.getElementById('formaPagamento').value
  };

  try {
    const resposta = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosReserva)
    });

    if (resposta.ok) {
      document.getElementById('reservaForm').style.display = 'none';
      document.getElementById('mensagemSucesso').style.display = 'block';
    } else {
      alert('Ocorreu um erro ao enviar a reserva. Verifique os dados e tente novamente.');
    }
  } catch (erro) {
    console.error('Erro de conexão:', erro);
    alert('Não foi possível conectar ao servidor. Certifique-se de que o backend está rodando!');
  }
});