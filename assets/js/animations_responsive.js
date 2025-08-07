(function () {
  // Funções para obter as dimensões reais dos contêineres HTML
  // Isso é crucial para que o D3.js saiba qual o espaço disponível definido pelo CSS.
  function getContainerDimensions(id) {
    const container = document.getElementById(id);
    if (container) {
      // offsetWidth e offsetHeight retornam a largura e altura visíveis do elemento.
      return {
        width: container.offsetWidth,
        height: container.offsetHeight,
      };
    }
    // Retorna um valor padrão caso o elemento não seja encontrado (evita erros)
    return { width: 250, height: 250 };
  }

  // --- Inicialização das dimensões dos contêineres ---
  let graphDims = getContainerDimensions("graph-container");
  let moleculeDims = getContainerDimensions("molecule-container");
  let fluidDims = getContainerDimensions("fluid-container");

  // ===== Grafo =====
  const nodes = [
    { id: "A", group: 1 },
    { id: "B", group: 1 },
    { id: "C", group: 2 },
    { id: "D", group: 2 },
    { id: "E", group: 3 },
    { id: "F", group: 3 },
    { id: "G", group: 1 },
  ];

  const links = [
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "B", target: "D" },
    { source: "C", target: "D" },
    { source: "C", target: "E" },
    { source: "E", target: "F" },
    { source: "F", target: "G" },
    { source: "G", target: "A" },
  ];

  const graphContainer = d3.select("#graph-container");
  const svgGraph = graphContainer
    .append("svg")
    .attr("viewBox", `0 0 ${graphDims.width} ${graphDims.height}`) // Define o viewBox com base nas dimensões do CSS
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto"); // Garante que o SVG preencha o contêiner HTML

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(80).strength(0.7))
    .force("charge", d3.forceManyBody().strength(-1050))
    .force("center", d3.forceCenter(graphDims.width / 2, graphDims.height / 2)); // Centraliza com base nas dimensões do CSS

  const link = svgGraph.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 2);

  const node = svgGraph.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 12)
    .attr("fill", d => color(d.group))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x; d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
  }

  // ===== Molécula Rotativa =====
  const moleculeContainer = d3.select("#molecule-container");
  const svgMolecule = moleculeContainer
    .append("svg")
    .attr("viewBox", "-60 -60 120 120") // Este viewBox pode permanecer fixo, a escala será feita pelo container CSS
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "70%")
    .style("height", "auto");

  const defs = svgMolecule.append("defs");
  [
    {id: "gradGray", stops: [{offset: "0%", color: "#bbb"}, {offset: "100%", color: "#444"}]},
    {id: "gradWhite", stops: [{offset: "0%", color: "#fff"}, {offset: "100%", color: "#ccc"}]},
    {id: "gradRed", stops: [{offset: "0%", color: "#ff6666"}, {offset: "100%", color: "#b30000"}]},
  ].forEach(g => {
    const grad = defs.append("radialGradient")
      .attr("id", g.id)
      .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
    g.stops.forEach(s => grad.append("stop").attr("offset", s.offset).attr("stop-color", s.color));
  });

  const atoms = [
    {x: 0, y: 0, r: 10, fill: "url(#gradGray)", stroke: "#666"},
    {x: 0, y: -20, r: 8, fill: "url(#gradWhite)", stroke: "#999"},
    {x: 18, y: 10, r: 8, fill: "url(#gradWhite)", stroke: "#999"},
    {x: -18, y: 10, r: 8, fill: "url(#gradWhite)", stroke: "#999"},
    {x: 0, y: 22, r: 8, fill: "url(#gradRed)", stroke: "#900"},
  ];
  const bonds = [
    {source: atoms[0], target: atoms[1]},
    {source: atoms[0], target: atoms[2]},
    {source: atoms[0], target: atoms[3]},
    {source: atoms[0], target: atoms[4]},
  ];

  function bondPath(d) {
    const sx = d.source.x, sy = d.source.y;
    const tx = d.target.x, ty = d.target.y;
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2 + (tx > sx ? 10 : -10);
    return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`;
  }

  svgMolecule.selectAll("path.bond")
    .data(bonds)
    .join("path")
    .attr("class", "bond")
    .attr("d", bondPath)
    .attr("stroke", "#999")
    .attr("stroke-width", 3)
    .attr("fill", "none");

  svgMolecule.selectAll("circle.atom")
    .data(atoms)
    .join("circle")
    .attr("class", "atom")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r)
    .attr("fill", d => d.fill)
    .attr("stroke", d => d.stroke)
    .attr("stroke-width", 1.5);

  let angle = 0;
  // A rotação já é animada e escalará com o SVG.
  // Não precisa de ajustes adicionais de tamanho aqui.
  d3.timer(() => {
    angle = (angle + 0.3) % 360;
    svgMolecule.attr("transform", `rotate(${angle})`);
  });

  // ===== Dinâmica dos Fluidos =====
  const fluidContainer = d3.select("#fluid-container");
  const svgFluid = fluidContainer
    .append("svg")
    .attr("viewBox", `0 0 ${fluidDims.width} 100`) // Define o viewBox com base na largura do CSS
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");

  // Ajuste as variáveis internas para usar as dimensões atuais do container
  const cylinderRadius = 20; // Manter este tamanho relativo ao viewBox
  // O cylinderCenterX e cylinderCenterY agora dependem das dimensões do container
  const cylinderCenterX = fluidDims.width / 2.5;
  const cylinderCenterY = fluidDims.height / 2; // Ajuste para ficar mais centralizado no container

  const numLines = 10;
  // Usar fluidDims.height para calcular o espaçamento das linhas
  const lineSpacing = fluidDims.height / (numLines - 1); // Ajuste o espaçamento das linhas com base na altura do CSS
  const amplitude = 6;
  const wavelength = 100;

  const linesData = d3.range(numLines).map(i => ({ yBase: i * lineSpacing }));
  const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveBasis);

  const paths = svgFluid.selectAll("path")
    .data(linesData)
    .join("path")
    .attr("stroke", "#3b7a57")
    .attr("stroke-width", 1.1)
    .attr("fill", "none")
    .attr("opacity", 0.4);

  svgFluid.append("circle")
    .attr("cx", cylinderCenterX)
    .attr("cy", cylinderCenterY)
    .attr("r", cylinderRadius)
    .attr("fill", "#f3f3f3")
    .attr("stroke", "#a3b6a1")
    .attr("stroke-width", 2);

  function displacement(x, lineY, time) {
    const distX = x - cylinderCenterX;
    const distY = lineY - cylinderCenterY;
    if (Math.abs(distX) < cylinderRadius * 2) {
      const gauss = Math.exp(-Math.pow(distX / cylinderRadius, 2));
      const wave = amplitude * Math.sin((2 * Math.PI / wavelength) * (x - time * 150));
      return gauss * wave * (distY > 0 ? 1 : -1);
    }
    return amplitude * Math.sin((2 * Math.PI / wavelength) * (x - time * 150));
  }

  function animate(time) {
    const t = time / 1000;
    paths.attr("d", d => {
      const points = [];
      for (let x = 0; x <= fluidDims.width; x += 10) { // Usa a largura atual do container
        const y = d.yBase + displacement(x, d.yBase, t);
        points.push({ x, y });
      }
      return lineGenerator(points);
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // --- Listener para redimensionamento da janela ---
  window.addEventListener("resize", () => {
    // Re-obtenha as dimensões dos contêineres HTML
    graphDims = getContainerDimensions("graph-container");
    moleculeDims = getContainerDimensions("molecule-container");
    fluidDims = getContainerDimensions("fluid-container");

    // --- Atualizar Grafo ---
    svgGraph.attr("viewBox", `0 0 ${graphDims.width} ${graphDims.height}`);
    simulation.force("center", d3.forceCenter(graphDims.width / 2, graphDims.height / 2)).alphaTarget(0.3).restart();

    // --- Atualizar Molécula ---
    // A molécula tem um viewBox fixo, então não precisa de atualização de viewBox.
    // Ela se escalará automaticamente com o CSS.
    // Se você quiser que o tamanho interno dos átomos ou a "densidade" da molécula mude,
    // precisaria recriar ou reajustar os átomos aqui (mais complexo).

    // --- Atualizar Dinâmica dos Fluidos ---
    svgFluid.attr("viewBox", `0 0 ${fluidDims.width} ${fluidDims.height}`); // Atualiza o viewBox completo

    // Reajusta a posição do cilindro com base nas novas dimensões do container
    svgFluid.select("circle")
        .attr("cx", fluidDims.width / 2.5)
        .attr("cy", fluidDims.height / 2);

    // Reajusta o espaçamento das linhas de fluido
    const newFluidLineSpacing = fluidDims.height / (numLines - 1);
    linesData.forEach((d, i) => d.yBase = i * newFluidLineSpacing);
    // As linhas serão redesenhadas na próxima animação frame com os novos yBase.
  });

})();