import { useRef, useEffect, useCallback } from "react";
import type { GraphNode } from "./use-force-simulation";

interface GraphCanvasProps {
  nodes: GraphNode[];
  hoveredNodeId: string | null;
  width: number;
  height: number;
  onNodeHover: (nodeId: string | null) => void;
  onNodeClick: (nodeId: string) => void;
}

function getNodeColor(distance: number): string {
  if (distance === 0) return "#5B8DEF";
  if (distance <= 2) return "#4070CC";
  if (distance === 3) return "#3860BB";
  return "#888888";
}

function getHoveredColor(distance: number): string {
  if (distance === 0) return "#729EF1";
  if (distance <= 2) return "#5B8DEF";
  if (distance === 3) return "#4070CC";
  return "#999999";
}

function drawMajorNode(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function drawMinorNode(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const rr = 4;
  ctx.beginPath();
  ctx.moveTo(x - r + rr, y - r);
  ctx.lineTo(x + r - rr, y - r);
  ctx.quadraticCurveTo(x + r, y - r, x + r, y - r + rr);
  ctx.lineTo(x + r, y + r - rr);
  ctx.quadraticCurveTo(x + r, y + r, x + r - rr, y + r);
  ctx.lineTo(x - r + rr, y + r);
  ctx.quadraticCurveTo(x - r, y + r, x - r, y + r - rr);
  ctx.lineTo(x - r, y - r + rr);
  ctx.quadraticCurveTo(x - r, y - r, x - r + rr, y - r);
  ctx.closePath();
}

function drawDiamondNode(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
}

function drawHexagonNode(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawTriangleNode(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.866, y + r * 0.5);
  ctx.lineTo(x - r * 0.866, y + r * 0.5);
  ctx.closePath();
}

const shapeDrawers: Record<string, typeof drawMajorNode> = {
  major: drawMajorNode,
  minor: drawMinorNode,
  "7th": drawDiamondNode,
  aug: drawHexagonNode,
  dim: drawTriangleNode,
};

export default function GraphCanvas({
  nodes,
  hoveredNodeId,
  width,
  height,
  onNodeHover,
  onNodeClick,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (const node of nodesRef.current) {
      if (node.opacity <= 0 || node.x == null || node.y == null) continue;

      const nx = node.x as number;
      const ny = node.y as number;
      const isHovered = node.id === hoveredNodeId;
      const scale = isHovered ? 1.15 : 1;
      const r = node.radius * scale;
      const color = isHovered ? getHoveredColor(node.distance) : getNodeColor(node.distance);

      ctx.globalAlpha = node.opacity;

      // Draw shape
      const drawShape = shapeDrawers[node.type] ?? drawMajorNode;
      drawShape(ctx, nx, ny, r);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${isHovered ? "bold " : ""}${Math.round(r * 0.55)}px 'Nunito', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.name, nx, ny);
    }

    ctx.globalAlpha = 1;
  }, [width, height, hoveredNodeId]);

  useEffect(() => {
    render();
  }, [render, nodes]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: string | null = null;
      for (const node of nodesRef.current) {
        const x = node.x as number | undefined;
        const y = node.y as number | undefined;
        if (x == null || y == null) continue;
        const dx = mx - x;
        const dy = my - y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
          found = node.id;
          break;
        }
      }
      onNodeHover(found);
    },
    [onNodeHover],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const node of nodesRef.current) {
        const x = node.x as number | undefined;
        const y = node.y as number | undefined;
        if (x == null || y == null) continue;
        const dx = mx - x;
        const dy = my - y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
          onNodeClick(node.id);
          return;
        }
      }
    },
    [onNodeClick],
  );

  const handleMouseLeave = useCallback(() => {
    onNodeHover(null);
  }, [onNodeHover]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Chord network graph"
    />
  );
}
