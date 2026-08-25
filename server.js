require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos garantindo o caminho correto do diretório
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa a conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const PRECOS_VELAS = {
  'Camomila & Mel': 25,
  'Capim-Limão': 25,
  'Baunilha Real': 25,
  'Alecrim Silvestre': 25
};

// Rota raiz: serve o index.html explicitamente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ mensagem: 'API da Loja Luz & Aroma funcionando perfeitamente!' });
});

// Rota POST: Enviar nova reserva
app.post('/api/reservas', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ erro: 'Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env.' });
  }

  const { nome_cliente, telefone, fragrancia, quantidade, forma_pagamento, itens } = req.body;

  if (!nome_cliente || !telefone || !forma_pagamento) {
    return res.status(400).json({ erro: 'Todos os campos obrigatórios precisam ser preenchidos.' });
  }

  const pagamentosAceitos = ['dinheiro', 'credito', 'debito', 'pix'];
  if (!pagamentosAceitos.includes(forma_pagamento)) {
    return res.status(400).json({ erro: 'Forma de pagamento inválida.' });
  }

  const itensReserva = Array.isArray(itens) && itens.length > 0
    ? itens
    : [{ fragrancia, quantidade }];

  if (itensReserva.some((item) => !PRECOS_VELAS[item.fragrancia] || !Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) < 1)) {
    return res.status(400).json({ erro: 'Informe ao menos uma vela com quantidade válida.' });
  }

  const pedidoId = crypto.randomUUID();

  try {
    const { data, error } = await supabase
      .from('reservas')
      .insert(itensReserva.map((item) => ({
        pedido_id: pedidoId,
        nome_cliente,
        telefone,
        fragrancia: item.fragrancia,
        quantidade: Number(item.quantidade),
        valor_final: PRECOS_VELAS[item.fragrancia] * Number(item.quantidade),
        forma_pagamento
      })))
      .select();

    if (error) {
      console.error('Erro no Supabase:', error);
      return res.status(500).json({ erro: 'Falha ao gravar reserva no banco de dados.' });
    }

    res.status(201).json({
      mensagem: 'Reserva gravada com sucesso!',
      reserva: data[0]
    });
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// Rota GET: Listar reservas
app.get('/api/reservas', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ erro: 'Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env.' });
  }

  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('data_reserva', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar reservas.' });
  }
});

// Inicialização local
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;