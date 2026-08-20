require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const { nome_cliente, telefone, fragrancia, quantidade } = req.body;

  if (!nome_cliente || !telefone || !fragrancia || !quantidade) {
    return res.status(400).json({ erro: 'Todos os campos obrigatórios precisam ser preenchidos.' });
  }

  try {
    const { data, error } = await supabase
      .from('reservas')
      .insert([
        { nome_cliente, telefone, fragrancia, quantidade: parseInt(quantidade) }
      ])
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