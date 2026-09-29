// ======================================================
// DADOS BRUTOS (fictícios) — 9º Ano
// Cada item é um OBJETO com: disciplina, notas dos tri, faltas
// ======================================================
const dados = [
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

// ======================================================
// FUNÇÃO: normalizarNota(valor)
// Converte qualquer nota para a escala 0–10.
// Regras:
//  - vazio / null / undefined  -> null (nota não lançada)
//  - 0 a 10                     -> mantém
//  - >10 e <=100                -> divide por 10
//  - aceita ponto ou vírgula
//  - valor inválido             -> null
// ======================================================
function normalizarNota(valor) {
  // Nota ausente
  if (valor === null || valor === undefined || valor === "") return null;

  // Se for texto, troca vírgula por ponto
  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }

  // Se não for número válido, retorna null
  if (isNaN(numero)) return null;

  // Se está entre 0 e 10, mantém
  if (numero >= 0 && numero <= 10) return numero;

  // Se está entre 10 e 100, divide por 10
  if (numero > 10 && numero <= 100) return numero / 10;

  // Fora das regras
  return null;
}

// ======================================================
// FUNÇÃO: calcularMedia(notas)
// Recebe um ARRAY de notas (já normalizadas) e retorna
// a média apenas das notas disponíveis (ignora null).
// Se não houver nenhuma nota válida, retorna null.
// ======================================================
function calcularMedia(notas) {
  const validas = notas.filter(function (n) { return n !== null; });
  if (validas.length === 0) return null;

  let soma = 0;
  validas.forEach(function (n) { soma += n; });
  return soma / validas.length;
}

// ======================================================
// FUNÇÃO: definirSituacao(media)
// Usa IF para decidir a situação de cada disciplina.
// ======================================================
function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= 6.0) return "Bom desempenho";
  return "Atenção";
}

// ======================================================
// FUNÇÃO: somarFaltas(listaFaltas)
// Soma as faltas dos 3 trimestres (números inteiros).
// ======================================================
function somarFaltas(listaFaltas) {
  let total = 0;
  listaFaltas.forEach(function (f) { total += f; });
  return total;
}

// ======================================================
// FUNÇÃO: formatarNota(numero)
// Mostra a nota com 1 casa decimal ou "—" se for null.
// ======================================================
function formatarNota(numero) {
  if (numero === null) return "—";
  return numero.toFixed(1).replace(".", ",");
}

// ======================================================
// PROCESSAMENTO DOS DADOS
// Percorre o array "dados", normaliza notas e cria um
// novo array com os resultados já calculados.
// ======================================================
const resultados = dados.map(function (item) {
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const faltasTotal = somarFaltas(item.faltas);
  const situacao = definirSituacao(media);

  return {
    disciplina: item.disciplina,
    tri1: n1,
    tri2: n2,
    tri3: n3,
    media: media,
    faltas: faltasTotal,
    situacao: situacao
  };
});

// ======================================================
// MONTAGEM DA TABELA (DOM)
// Cria as 15 linhas automaticamente, sem escrever no HTML.
// ======================================================
const corpoTabela = document.getElementById("corpo-tabela");

resultados.forEach(function (r) {
  const linha = document.createElement("tr");

  // Classe de cor conforme a situação
  let classeSituacao = "situacao-ausente";
  if (r.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  else if (r.situacao === "Atenção") classeSituacao = "situacao-atencao";

  linha.innerHTML = `
    <td>${r.disciplina}</td>
    <td>${r.tri1 === null ? "Ainda não lançada" : formatarNota(r.tri1)}</td>
    <td>${r.tri2 === null ? "Ainda não lançada" : formatarNota(r.tri2)}</td>
    <td>${r.tri3 === null ? "Ainda não lançada" : formatarNota(r.tri3)}</td>
    <td>${r.media === null ? "—" : formatarNota(r.media)}</td>
    <td>${r.faltas}</td>
    <td class="${classeSituacao}">${r.situacao}</td>
  `;

  corpoTabela.appendChild(linha);
});

// ======================================================
// CÁLCULO DOS CARDS DE RESUMO
// ======================================================

// Média geral: média das médias disponíveis
const mediasDisponiveis = resultados
  .filter(function (r) { return r.media !== null; })
  .map(function (r) { return r.media; });

const mediaGeral = calcularMedia(mediasDisponiveis);

// Total de faltas de todas as disciplinas
let totalFaltas = 0;
resultados.forEach(function (r) { totalFaltas += r.faltas; });

// Disciplinas com bom desempenho e com atenção
const comBomDesempenho = resultados.filter(function (r) {
  return r.situacao === "Bom desempenho";
}).length;

const comAtencao = resultados.filter(function (r) {
  return r.situacao === "Atenção";
}).length;

// Frequência FICTÍCIA apenas para demonstração.
// NÃO é calculada a partir das faltas.
// No futuro, será tratada de outra forma.
const frequenciaDemonstrativa = 92;

// ======================================================
// MONTAGEM DOS CARDS (DOM)
// ======================================================
const areaCards = document.getElementById("cards");

// Função auxiliar para criar um card
function criarCard(titulo, valor, extra, cor) {
  const card = document.createElement("div");
  card.className = "card " + (cor || "");
  card.innerHTML = `
    <div class="titulo-card">${titulo}</div>
    <div class="valor-card">${valor}</div>
    ${extra ? `<div class="extra-card">${extra}</div>` : ""}
  `;
  areaCards.appendChild(card);
}

// Cria os 5 cards
criarCard("Média geral",
  mediaGeral === null ? "—" : formatarNota(mediaGeral),
  "Escala 0 a 10", "ciano");

criarCard("Total de faltas", totalFaltas, "Todos os trimestres", "amarelo");

criarCard("Bom desempenho", comBomDesempenho, "disciplinas", "verde");

criarCard("Precisam de atenção", comAtencao, "disciplinas", "vermelho");

criarCard("Frequência demonstrativa",
  frequenciaDemonstrativa + "%",
  "Frequência adequada", "ciano");