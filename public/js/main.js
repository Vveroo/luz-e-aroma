function selecionarFragrancia(nomeFragrancia) {
  document.getElementById('fragrancia').value = nomeFragrancia;
  document.getElementById('area-reserva').scrollIntoView({ behavior: 'smooth' });
}

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

  const dadosReserva = {
    nome_cliente: nome,
    telefone: telefone,
    fragrancia: document.getElementById('fragrancia').value,
    quantidade: document.getElementById('quantidade').value
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