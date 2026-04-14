import { useRef, useEffect, useCallback, useState } from "react";
import type { GraphNode } from "./use-force-simulation";

interface GraphCanvasProps {
  nodes: GraphNode[];
  hoveredNodeId: string | null;
  width: number;
  height: number;
  panEnabled: boolean;
  currentKey: string;
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
  panEnabled,
  currentKey,
  onNodeHover,
  onNodeClick,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;

  // Reset pan when panEnabled changes or key changes
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [panEnabled, currentKey]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ox = panOffsetRef.current.x;
    const oy = panOffsetRef.current.y;

    ctx.clearRect(0, 0, width, height);

    for (const node of nodesRef.current) {
      if (node.opacity <= 0 || node.x == null || node.y == null) continue;

      const nx = (node.x as number) + ox;
      const ny = (node.y as number) + oy;
      const isHovered = node.id === hoveredNodeId;
      const scale = isHovered ? 1.15 : 1;
      const r = node.radius * scale;
      const color = isHovered ? getHoveredColor(node.distance) : getNodeColor(node.distance);

      ctx.globalAlpha = node.opacity;

      // Invitation pulse glow on neighboring nodes
      if (node.pulsePhase > 0) {
        const glowRadius = r + 4 + node.pulsePhase * 6;
        ctx.beginPath();
        ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 141, 239, ${node.pulsePhase * 0.25})`;
        ctx.fill();
      }

      const drawShape = shapeDrawers[node.type] ?? drawMajorNode;
      drawShape(ctx, nx, ny, r);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

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
  }, [render, nodes, panOffset]);

  function getMousePos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { mx: 0, my: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      mx: e.clientX - rect.left - panOffsetRef.current.x,
      my: e.clientY - rect.top - panOffsetRef.current.y,
    };
  }

  function findNodeAt(mx: number, my: number): string | null {
    for (const node of nodesRef.current) {
      if (node.opacity <= 0) continue;
      const x = node.x as number | undefined;
      const y = node.y as number | undefined;
      if (x == null || y == null) continue;
      const dx = mx - x;
      const dy = my - y;
      if (dx * dx + dy * dy < node.radius * node.radius) {
        return node.id;
      }
    }
    return null;
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!panEnabled) return;
      isDragging.current = true;
      didDrag.current = false;
      dragStart.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y };
    },
    [panEnabled],
  );

  const lastHoveredRef = useRef<string | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging.current && panEnabled) {
        didDrag.current = true;
        setPanOffset({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
        return;
      }

      const { mx, my } = getMousePos(e);
      const nodeId = findNodeAt(mx, my);
      if (nodeId !== lastHoveredRef.current) {
        lastHoveredRef.current = nodeId;
        onNodeHover(nodeId);
      }
    },
    [onNodeHover, panEnabled],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (didDrag.current) {
        didDrag.current = false;
        return;
      }
      const { mx, my } = getMousePos(e);
      const nodeId = findNodeAt(mx, my);
      if (nodeId) onNodeClick(nodeId);
    },
    [onNodeClick],
  );

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    didDrag.current = false;
    onNodeHover(null);
  }, [onNodeHover]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block ${panEnabled ? "cursor-grab active:cursor-grabbing" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Chord network graph"
    />
  );
}
