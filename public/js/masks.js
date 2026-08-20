document.addEventListener('DOMContentLoaded', () => {
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');

  // 1. Validação do Nome: Apenas letras e espaços (sem travar o cursor)
  if (nomeInput) {
    // Força o texto a aparecer maiúsculo visualmente via CSS
    nomeInput.style.textTransform = 'capitalize';

    nomeInput.addEventListener('input', function () {
      // Apenas remove caracteres inválidos (números/símbolos)
      this.value = this.value.replace(/[^a-zA-Aà-úÀ-Ú\s]/g, '');
    });

    // Formata o valor real para maiúsculas quando o usuário sai do campo
    nomeInput.addEventListener('blur', function () {
      this.value = this.value
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (letra) => letra.toUpperCase());
    });
  }

  // 2. Máscara do Telefone: Apenas números + formatação (00) 00000-0000
  if (telefoneInput) {
    telefoneInput.addEventListener('input', function () {
      let valor = this.value.replace(/\D/g, '');

      if (valor.length > 11) {
        valor = valor.slice(0, 11);
      }

      if (valor.length > 10) {
        this.value = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (valor.length > 6) {
        this.value = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (valor.length > 2) {
        this.value = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (valor.length > 0) {
        this.value = valor.replace(/^(\d{0,2})/, '($1');
      } else {
        this.value = '';
      }
    });
  }
});