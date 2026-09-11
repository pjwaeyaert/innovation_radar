const radarData = {
  topics: ["AI", "Data", "Security", "Cloud", "Developer Experience"],
  stages: ["Internal", "Assess", "Trial", "Adopt"],
  entries: [
    { label: "Prompt library", topic: "AI", stage: "Internal", color: "#2563eb" },
    { label: "RAG search", topic: "AI", stage: "Internal", color: "#7c3aed" },
    { label: "Lakehouse", topic: "Data", stage: "Trial", color: "#0f766e" },
    { label: "PII scanner", topic: "Security", stage: "Assess", color: "#dc2626" },
    { label: "Golden paths", topic: "Developer Experience", stage: "Adopt", color: "#ea580c" },
    { label: "Platform metrics", topic: "Cloud", stage: "Trial", color: "#0891b2" },
    { label: "Vector cache", topic: "AI", stage: "Internal", color: "#16a34a" },
    { label: "Schema contracts", topic: "Data", stage: "Trial", color: "#ca8a04" }
  ]
};

const svg = document.getElementById("radar");
const legendList = document.getElementById("legend-list");
const size = 900;
const center = size / 2;
const outerRadius = 320;
const labelRadius = outerRadius + 42;
const ringWidth = outerRadius / radarData.stages.length;
const sliceAngle = (Math.PI * 2) / radarData.topics.length;

const ns = "http://www.w3.org/2000/svg";

function polarToCartesian(radius, angle) {
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius
  };
}

function createSvgElement(name, attrs = {}) {
  const element = document.createElementNS(ns, name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function describeArc(radius, startAngle, endAngle) {
  const start = polarToCartesian(radius, startAngle);
  const end = polarToCartesian(radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function ringBounds(stageIndex) {
  return {
    inner: stageIndex * ringWidth,
    outer: (stageIndex + 1) * ringWidth,
    middle: (stageIndex + 0.5) * ringWidth
  };
}

function renderGrid() {
  const background = createSvgElement("rect", {
    x: 20,
    y: 20,
    width: size - 40,
    height: size - 40,
    rx: 24,
    fill: "#ffffff"
  });
  svg.appendChild(background);

  radarData.stages.forEach((stage, stageIndex) => {
    const { outer } = ringBounds(stageIndex);
    svg.appendChild(createSvgElement("circle", {
      cx: center,
      cy: center,
      r: outer,
      fill: "none",
      stroke: "#cbd5e1",
      "stroke-width": 1.5
    }));
  });

  radarData.topics.forEach((topic, topicIndex) => {
    const angle = -Math.PI / 2 + topicIndex * sliceAngle;
    const point = polarToCartesian(outerRadius, angle);
    svg.appendChild(createSvgElement("line", {
      x1: center,
      y1: center,
      x2: point.x,
      y2: point.y,
      stroke: "#cbd5e1",
      "stroke-width": 1.5
    }));

    const labelPoint = polarToCartesian(labelRadius, angle + sliceAngle / 2);
    const label = createSvgElement("text", {
      x: labelPoint.x,
      y: labelPoint.y,
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      fill: "#0f172a",
      "font-size": 18,
      "font-weight": 600
    });
    label.textContent = topic;
    svg.appendChild(label);
  });

  radarData.stages.forEach((stage, stageIndex) => {
    const { middle } = ringBounds(stageIndex);
    const labelPoint = polarToCartesian(middle, Math.PI * 1.25);
    const text = createSvgElement("text", {
      x: labelPoint.x,
      y: labelPoint.y,
      fill: "#334155",
      "font-size": 16,
      "font-weight": 600,
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    });
    text.textContent = stage;

    const paddingX = 12;
    const paddingY = 8;
    const estimatedWidth = stage.length * 9 + paddingX * 2;
    const box = createSvgElement("rect", {
      x: labelPoint.x - estimatedWidth / 2,
      y: labelPoint.y - 16,
      width: estimatedWidth,
      height: 32,
      rx: 16,
      fill: "#ffffff",
      stroke: stageIndex === 0 ? "#2563eb" : "#cbd5e1",
      "stroke-width": stageIndex === 0 ? 2 : 1.5
    });

    svg.appendChild(box);
    svg.appendChild(text);
  });
}

function renderEntries() {
  const cellGroups = new Map();

  radarData.entries.forEach((entry) => {
    const topicIndex = radarData.topics.indexOf(entry.topic);
    const stageIndex = radarData.stages.indexOf(entry.stage);

    if (topicIndex === -1 || stageIndex === -1) {
      return;
    }

    const key = `${topicIndex}-${stageIndex}`;
    if (!cellGroups.has(key)) {
      cellGroups.set(key, []);
    }
    cellGroups.get(key).push({ entry, topicIndex, stageIndex });
  });

  cellGroups.forEach((items, key) => {
    const [topicIndex, stageIndex] = key.split("-").map(Number);
    const angle = -Math.PI / 2 + topicIndex * sliceAngle + sliceAngle / 2;
    const { middle } = ringBounds(stageIndex);
    const base = polarToCartesian(middle, angle);
    const radialX = Math.cos(angle);
    const radialY = Math.sin(angle);
    const tangentX = -Math.sin(angle);
    const tangentY = Math.cos(angle);
    const spacing = 18;
    const columns = Math.ceil(Math.sqrt(items.length));

    items.forEach(({ entry }, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const tangentOffset = (column - (columns - 1) / 2) * spacing;
      const rowCount = Math.ceil(items.length / columns);
      const radialOffset = (row - (rowCount - 1) / 2) * spacing;
      const x = base.x + tangentX * tangentOffset + radialX * radialOffset;
      const y = base.y + tangentY * tangentOffset + radialY * radialOffset;
      const group = createSvgElement("g", {
        "aria-label": `${entry.label} — ${entry.topic}, ${entry.stage}`
      });
      const title = createSvgElement("title");
      title.textContent = `${entry.label} — ${entry.topic}, ${entry.stage}`;

      group.appendChild(title);
      group.appendChild(createSvgElement("circle", {
        cx: x,
        cy: y,
        r: 8,
        fill: entry.color,
        stroke: "#ffffff",
        "stroke-width": 3
      }));

      const label = createSvgElement("text", {
        x,
        y: y - 18,
        "text-anchor": "middle",
        fill: "#0f172a",
        "font-size": 12,
        "font-weight": 600
      });
      label.textContent = entry.label;
      group.appendChild(label);
      svg.appendChild(group);
    });
  });
}

function renderLegend() {
  radarData.entries.forEach((entry) => {
    const item = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = entry.color;

    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = entry.label;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${entry.topic} · ${entry.stage}`;

    text.append(title, meta);
    item.append(swatch, text);
    legendList.appendChild(item);
  });
}

renderGrid();
renderEntries();
renderLegend();
