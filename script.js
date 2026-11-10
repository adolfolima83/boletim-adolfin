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

      // Faltas modo edição (3 campos ou 1 total se resumido)
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
          ticks: {