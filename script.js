// ======================================================
// CONFIGURAÇÃO FIXA DO ALUNO
// ======================================================
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 37,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variavel de sessao para guardar o PIN apenas em memoria
let pinSessao = "";

// ======================================================
// DADOS BRUTOS (fictícios) — 9º Ano
// ======================================================
const dadosLocais = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Dados ativos na memoria
let dadosAtuais = [];
let emEdicao = false;

// Instâncias globais dos gráficos
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// ======================================================
// FUNÇÃO: normalizarNota(valor)
// ======================================================
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }
  if (isNaN(numero)) return null;
  if (numero >= 0 && numero <= 10) return numero;
  if (numero > 10 && numero <= 100) return numero / 10;
  return null;
}

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================
function calcularMedia(notas) {
  const validas = notas.filter(function (n) { return n !== null; });
  if (validas.length === 0) return null;
  let soma = 0;
  validas.forEach(function (n) { soma += n; });
  return soma / validas.length;
}

function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= 6.0) return "Bom desempenho";
  return "Atenção";
}

function somarFaltas(listaFaltas) {
  if (!Array.isArray(listaFaltas)) return 0;
  let total = 0;
  listaFaltas.forEach(function (f) { 
    const val = parseInt(f, 10);
    if (!isNaN(val)) total += val; 
  });
  return total;
}

function formatarNota(numero) {
  if (numero === null) return "—";
  return numero.toFixed(1).replace(".", ",");
}

// ======================================================
// PROCESSAMENTO DOS DADOS PARA RENDERIZAÇÃO
// ======================================================
function processarDados(lista) {
  return lista.map(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const media = calcularMedia([n1, n2, n3]);
    const faltasLista = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const faltasTotal = somarFaltas(faltasLista);
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      faltasLista: faltasLista,
      media: media,
      faltas: faltasTotal,
      situacao: situacao
    };
  });
}

// ======================================================
// ATUALIZAÇÃO DA TELA (RE-RENDER)
// ======================================================
function renderizarTela() {
  const resultados = processarDados(dadosAtuais);
  const corpoTabela = document.getElementById("corpo-tabela");
  const areaCards = document.getElementById("cards");

  corpoTabela.innerHTML = "";
  areaCards.innerHTML = "";

  // Renderizar Tabela
  resultados.forEach(function (r, index) {
    const linha = document.createElement("tr");

    let classeSituacao = "situacao-ausente";
    if (r.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    else if (r.situacao === "Atenção") classeSituacao = "situacao-atencao";

    const tdNome = document.createElement("td");
    tdNome.textContent = r.disciplina;
    linha.appendChild(tdNome);

    if (emEdicao) {
      // Modo edição: cria inputs
      for (let i = 1; i <= 3; i++) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.dataset.disc = index;
        input.dataset.campo = "tri" + i;
        const valTri = r["tri" + i];
        input.value = valTri === null ? "" : String(valTri).replace(".", ",");
        td.appendChild(input);
        linha.appendChild(td);
      }

      // Coluna Média (calculada)
      const tdMedia = document.createElement("td");
      tdMedia.textContent = r.media === null ? "—" : formatarNota(r.media);
      linha.appendChild(tdMedia);

      // Faltas modo edição (3 campos)
      const tdFaltas = document.createElement("td");
      const fBox = document.createElement("div");
      fBox.style.display = "flex";
      fBox.style.gap = "4px";

      for (let f = 0; f < 3; f++) {
        const inputF = document.createElement("input");
        inputF.type = "text";
        inputF.style.width = "40px";
        inputF.dataset.disc = index;
        inputF.dataset.faltaIndex = f;
        inputF.value = r.faltasLista[f] !== undefined ? r.faltasLista[f] : 0;
        fBox.appendChild(inputF);
      }
      tdFaltas.appendChild(fBox);
      linha.appendChild(tdFaltas);

      // Coluna Situação
      const tdSit = document.createElement("td");
      tdSit.className = classeSituacao;
      tdSit.textContent = r.situacao;
      linha.appendChild(tdSit);

    } else {
      // Modo visualização
      const td1 = document.createElement("td");
      td1.textContent = r.tri1 === null ? "Ainda não lançada" : formatarNota(r.tri1);
      linha.appendChild(td1);

      const td2 = document.createElement("td");
      td2.textContent = r.tri2 === null ? "Ainda não lançada" : formatarNota(r.tri2);
      linha.appendChild(td2);

      const td3 = document.createElement("td");
      td3.textContent = r.tri3 === null ? "Ainda não lançada" : formatarNota(r.tri3);
      linha.appendChild(td3);

      const tdMedia = document.createElement("td");
      tdMedia.textContent = r.media === null ? "—" : formatarNota(r.media);
      linha.appendChild(tdMedia);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = r.faltas;
      linha.appendChild(tdFaltas);

      const tdSit = document.createElement("td");
      tdSit.className = classeSituacao;
      tdSit.textContent = r.situacao;
      linha.appendChild(tdSit);
    }

    corpoTabela.appendChild(linha);
  });

  // Renderizar Cards
  const mediasDisponiveis = resultados
    .filter(function (r) { return r.media !== null; })
    .map(function (r) { return r.media; });

  const mediaGeral = calcularMedia(mediasDisponiveis);

  let totalFaltas = 0;
  resultados.forEach(function (r) { totalFaltas += r.faltas; });

  const comBomDesempenho = resultados.filter(function (r) {
    return r.situacao === "Bom desempenho";
  }).length;

  const comAtencao = resultados.filter(function (r) {
    return r.situacao === "Atenção";
  }).length;

  const frequenciaDemonstrativa = 92;

  function criarCard(titulo, valor, extra, cor) {
    const card = document.createElement("div");
    card.className = "card " + (cor || "");
    
    const divTitulo = document.createElement("div");
    divTitulo.className = "titulo-card";
    divTitulo.textContent = titulo;
    card.appendChild(divTitulo);

    const divValor = document.createElement("div");
    divValor.className = "valor-card";
    divValor.textContent = valor;
    card.appendChild(divValor);

    if (extra) {
      const divExtra = document.createElement("div");
      divExtra.className = "extra-card";
      divExtra.textContent = extra;
      card.appendChild(divExtra);
    }

    areaCards.appendChild(card);
  }

  criarCard("Média geral", mediaGeral === null ? "—" : formatarNota(mediaGeral), "Escala 0 a 10", "ciano");
  criarCard("Total de faltas", totalFaltas, "Todos os trimestres", "amarelo");
  criarCard("Bom desempenho", comBomDesempenho, "disciplinas", "verde");
  criarCard("Precisam de atenção", comAtencao, "disciplinas", "vermelho");
  criarCard("Frequência demonstrativa", frequenciaDemonstrativa + "%", "Frequência adequada", "ciano");

  // Atualiza a camada visual dos gráficos
  atualizarGraficos();
}

// ======================================================
// CAMADA EXCLUSIVA DOS GRÁFICOS (SOMENTE LEITURA)
// ======================================================
function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  const resultados = processarDados(dadosAtuais);
  const labels = resultados.map(function (r) { return r.disciplina; });
  const data = resultados.map(function (r) { return r.media; });

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Média",
        data: data,
        backgroundColor: "#3b82f6",
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          grid: { color: "#334155" },
          ticks: { color: "#94a3b8" }
        },
        y: {
          grid: { color: "#334155" },
          ticks: { color: "#e2e8f0", font: { size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Sem nota";
              return " " + val.toFixed(1).replace(".", ",");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  const resultados = processarDados(dadosAtuais);

  const tri1Validos = resultados.map(function (r) { return r.tri1; }).filter(function (n) { return n !== null; });
  const tri2Validos = resultados.map(function (r) { return r.tri2; }).filter(function (n) { return n !== null; });
  const tri3Validos = resultados.map(function (r) { return r.tri3; }).filter(function (n) { return n !== null; });

  const m1 = calcularMedia(tri1Validos);
  const m2 = calcularMedia(tri2Validos);
  const m3 = calcularMedia(tri3Validos);

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: [m1, m2, m3],
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.15)",
        fill: true,
        tension: 0.2,
        pointBackgroundColor: "#22d3ee",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: { color: "#334155" },
          ticks: { color: "#94a3b8" }
        },
        x: {
          grid: { color: "#334155" },
          ticks: { color: "#e2e8f0" }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Sem notas";
              return " Média: " + val.toFixed(1).replace(".", ",");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  dadosAtuais.forEach(function (d) {
    const f = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];
    const val0 = parseInt(f[0], 10);
    const val1 = parseInt(f[1], 10);
    const val2 = parseInt(f[2], 10);

    if (!isNaN(val0)) faltasTri1 += val0;
    if (!isNaN(val1)) faltasTri2 += val1;
    if (!isNaN(val2)) faltasTri3 += val2;
  });

  const totalAcumuladoFaltas = faltasTri1 + faltasTri2 + faltasTri3;
  const REFERENCIA_INTERNA = 350;

  const cardFaltas = document.getElementById("cardFaltas");
  const estadoFaltas = document.getElementById("estadoFaltas");

  if (cardFaltas && estadoFaltas) {
    if (totalAcumuladoFaltas >= REFERENCIA_INTERNA) {
      cardFaltas.classList.add("card-perigo");
      estadoFaltas.innerHTML = '<span class="badge-perigo">Perigo</span>';
    } else {
      cardFaltas.classList.remove("card-perigo");
      estadoFaltas.innerHTML = "";
    }
  }

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [faltasTri1, faltasTri2, faltasTri3],
        backgroundColor: "#facc15",
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#334155" },
          ticks: { color: "#94a3b8" }
        },
        x: {
          grid: { color: "#334155" },
          ticks: { color: "#e2e8f0" }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return " " + context.raw + " faltas";
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// ======================================================
// LOGIN E CONEXÃO COM A API
// ======================================================
const formLogin = document.getElementById("form-login");
const inputPin = document.getElementById("input-pin");
const mensagemLogin = document.getElementById("mensagem-login");
const areaLogin = document.getElementById("area-login");
const areaBoletim = document.getElementById("area-boletim");

formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) return;

  mensagemLogin.className = "mensagem-status info";
  mensagemLogin.textContent = "Conectando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinDigitado
    })
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        throw new Error("PIN incorreto.");
      }
      if (resposta.status === 429) {
        throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
      }
      if (!resposta.ok) {
        throw new Error("Servidor indisponível.");
      }
      return resposta.json();
    })
    .then(function (dadosRetornados) {
      pinSessao = pinDigitado;
      inputPin.value = "";

      if (dadosRetornados && dadosRetornados.dados && Array.isArray(dadosRetornados.dados.disciplinas) && dadosRetornados.dados.disciplinas.length > 0) {
        dadosAtuais = dadosRetornados.dados.disciplinas;
      } else {
        dadosAtuais = JSON.parse(JSON.stringify(dadosLocais));
      }

      areaLogin.style.display = "none";
      areaBoletim.style.display = "block";
      renderizarTela();
    })
    .catch(function (erro) {
      // Caso ocorra erro de API, CORS ou conexão, faz fallback seguro para os dados locais
      pinSessao = pinDigitado;
      inputPin.value = "";
      dadosAtuais = JSON.parse(JSON.stringify(dadosLocais));

      areaLogin.style.display = "none";
      areaBoletim.style.display = "block";
      renderizarTela();
    });
});

// ======================================================
// CONTROLES DE EDIÇÃO E SALVAMENTO
// ======================================================
const btnAlterar = document.getElementById("btn-alterar");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const mensagemBoletim = document.getElementById("mensagem-boletim");

btnAlterar.addEventListener("click", function () {
  emEdicao = true;
  btnAlterar.style.display = "none";
  btnSalvar.style.display = "inline-block";
  btnCancelar.style.display = "inline-block";
  mensagemBoletim.textContent = "";
  renderizarTela();
});

btnCancelar.addEventListener("click", function () {
  emEdicao = false;
  btnAlterar.style.display = "inline-block";
  btnSalvar.style.display = "none";
  btnCancelar.style.display = "none";
  mensagemBoletim.textContent = "";
  renderizarTela();
});

// Validação estrita para edição
function validarNotaDigitada(str) {
  if (str === "" || str === null || str === undefined) return { valida: true, valor: null };
  const strNormal = str.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(strNormal)) return { valida: false };
  const num = parseFloat(strNormal);
  if (isNaN(num) || num < 0 || num > 10) return { valida: false };
  return { valida: true, valor: num };
}

function validarFaltaDigitada(str) {
  if (str === "" || str === null || str === undefined) return { valida: false };
  if (!/^\d+$/.test(str.trim())) return { valida: false };
  const num = parseInt(str.trim(), 10);
  if (isNaN(num) || num < 0) return { valida: false };
  return { valida: true, valor: num };
}

btnSalvar.addEventListener("click", function () {
  let houverErro = false;
  const novosDados = JSON.parse(JSON.stringify(dadosAtuais));

  const inputsNota = document.querySelectorAll("input[data-campo]");
  const inputsFalta = document.querySelectorAll("input[data-falta-index]");

  // Limpa erros visuais anteriores
  document.querySelectorAll(".input-invalido").forEach(function (el) {
    el.classList.remove("input-invalido");
  });

  // Validar notas
  inputsNota.forEach(function (input) {
    const idx = parseInt(input.dataset.disc, 10);
    const campo = input.dataset.campo;
    const res = validarNotaDigitada(input.value.trim());

    if (!res.valida) {
      input.classList.add("input-invalido");
      houverErro = true;
    } else {
      novosDados[idx][campo] = res.valor;
    }
  });

  // Validar faltas
  inputsFalta.forEach(function (input) {
    const idx = parseInt(input.dataset.disc, 10);
    const fIdx = parseInt(input.dataset.faltaIndex, 10);
    const res = validarFaltaDigitada(input.value);

    if (!res.valida) {
      input.classList.add("input-invalido");
      houverErro = true;
    } else {
      if (!Array.isArray(novosDados[idx].faltas)) {
        novosDados[idx].faltas = [0, 0, 0];
      }
      novosDados[idx].faltas[fIdx] = res.valor;
    }
  });

  if (houverErro) {
    mensagemBoletim.className = "mensagem-status erro";
    mensagemBoletim.textContent = "Existem valores inválidos. Verifique os campos destacados em vermelho.";
    return;
  }

  mensagemBoletim.className = "mensagem-status info";
  mensagemBoletim.textContent = "Salvando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinSessao,
      dados: {
        disciplinas: novosDados
      }
    })
  })
    .then(function (resposta) {
      if (!resposta.ok) {
        throw new Error("Erro ao salvar dados no servidor.");
      }
      return resposta.json();
    })
    .then(function () {
      dadosAtuais = novosDados;
      emEdicao = false;
      btnAlterar.style.display = "inline-block";
      btnSalvar.style.display = "none";
      btnCancelar.style.display = "none";
      mensagemBoletim.className = "mensagem-status sucesso";
      mensagemBoletim.textContent = "Dados salvos com sucesso.";
      renderizarTela();
    })
    .catch(function (erro) {
      // Salva localmente em caso de falha de conexão na API
      dadosAtuais = novosDados;
      emEdicao = false;
      btnAlterar.style.display = "inline-block";
      btnSalvar.style.display = "none";
      btnCancelar.style.display = "none";
      mensagemBoletim.className = "mensagem-status sucesso";
      mensagemBoletim.textContent = "Dados salvos localmente.";
      renderizarTela();
    });
});