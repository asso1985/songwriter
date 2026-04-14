import { useRef, useEffect, useCallback, useState } from "react";
import type { GraphNode } from "./use-force-simulation";
import { getChordEmoji } from "./chord-emoji";

const COMMIT_BUTTON_RADIUS = 14;

interface GraphCanvasProps {
  nodes: GraphNode[];
  hoveredNodeId: string | null;
  previewingNodeId: string | null;
  /** When set, triggers a 300ms ease-in-out pan to center this node */
  recenterNodeId: string | null;
  width: number;
  height: number;
  panEnabled: boolean;
  currentKey: string;
  onNodeHover: (nodeId: string | null) => void;
  onNodeClick: (nodeId: string) => void;
  onCommit: (nodeId: string) => void;
  onDismissPreview: () => void;
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
  previewingNodeId,
  recenterNodeId,
  width,
  height,
  panEnabled,
  currentKey,
  onNodeHover,
  onNodeClick,
  onCommit,
  onDismissPreview,
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

  // Recenter animation when a chord is committed
  useEffect(() => {
    if (!recenterNodeId) return;

    const targetNode = nodesRef.current.find((n) => n.id === recenterNodeId);
    if (!targetNode || targetNode.x == null || targetNode.y == null) return;

    const startPan = { ...panOffsetRef.current };
    const targetPan = {
      x: width / 2 - (targetNode.x as number),
      y: height / 2 - (targetNode.y as number),
    };

    const startTime = performance.now();
    const DURATION = 300;
    let rafId: number;

    function animateRecenter() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      // Ease-in-out cubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setPanOffset({
        x: startPan.x + (targetPan.x - startPan.x) * ease,
        y: startPan.y + (targetPan.y - startPan.y) * ease,
      });

      if (t < 1) {
        rafId = requestAnimationFrame(animateRecenter);
      }
    }

    rafId = requestAnimationFrame(animateRecenter);
    return () => cancelAnimationFrame(rafId);
  }, [recenterNodeId, width, height]);

  // Preview glow animation phase
  const previewPhaseRef = useRef(0);
  const previewRafRef = useRef(0);
  const prevPreviewingRef = useRef<string | null>(null);

  // Reset pan when panEnabled changes or key changes
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [panEnabled, currentKey]);

  // Animate preview glow (with 150ms fade-out on dismiss)
  useEffect(() => {
    if (!previewingNodeId) {
      // Fade out over 150ms if there was a previous preview
      if (prevPreviewingRef.current && previewPhaseRef.current > 0) {
        const fadeStart = performance.now();
        const startPhase = previewPhaseRef.current;
        const FADE_OUT_MS = 150;
        let fadeRafId: number;

        function fadeOut() {
          const elapsed = performance.now() - fadeStart;
          const t = Math.min(elapsed / FADE_OUT_MS, 1);
          previewPhaseRef.current = startPhase * (1 - t);
          if (t < 1) {
            fadeRafId = requestAnimationFrame(fadeOut);
          } else {
            previewPhaseRef.current = 0;
          }
        }
        fadeRafId = requestAnimationFrame(fadeOut);
        prevPreviewingRef.current = null;
        return () => cancelAnimationFrame(fadeRafId);
      }
      previewPhaseRef.current = 0;
      cancelAnimationFrame(previewRafRef.current);
      prevPreviewingRef.current = null;
      return;
    }

    prevPreviewingRef.current = previewingNodeId;
    let startTime = performance.now();
    const CYCLE_MS = 1200;

    function animate() {
      const elapsed = performance.now() - startTime;
      previewPhaseRef.current =
        Math.sin((elapsed / CYCLE_MS) * Math.PI * 2) * 0.5 + 0.5;
      previewRafRef.current = requestAnimationFrame(animate);
    }

    previewRafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(previewRafRef.current);
  }, [previewingNodeId]);

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
      const isPreviewing = node.id === previewingNodeId;
      const scale = isHovered ? 1.15 : 1;
      const r = node.radius * scale;
      const color = isHovered
        ? getHoveredColor(node.distance)
        : getNodeColor(node.distance);

      ctx.globalAlpha = node.opacity;

      // Invitation pulse glow on neighboring nodes (from initial load)
      if (node.pulsePhase > 0 && !isPreviewing) {
        const glowRadius = r + 4 + node.pulsePhase * 6;
        ctx.beginPath();
        ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 141, 239, ${node.pulsePhase * 0.25})`;
        ctx.fill();
      }

      // Preview glow on the currently previewing node
      if (isPreviewing) {
        const phase = previewPhaseRef.current;
        const glowRadius = r + 5 + phase * 8;
        ctx.beginPath();
        ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 141, 239, ${0.15 + phase * 0.2})`;
        ctx.fill();
      }

      const drawShape = shapeDrawers[node.type] ?? drawMajorNode;
      drawShape(ctx, nx, ny, r);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isPreviewing
        ? "rgba(91, 141, 239, 0.8)"
        : "rgba(255,255,255,0.3)";
      ctx.lineWidth = isPreviewing ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${isHovered || isPreviewing ? "bold " : ""}${Math.round(r * 0.55)}px 'Nunito', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.name, nx, ny);

      // Draw emoji cue on hovered node (top-right)
      if (isHovered && !isPreviewing) {
        const emoji = getChordEmoji(node.distance);
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, nx + r * 0.6, ny - r * 0.6);
      }

      // Draw "+" commit button on previewing node
      if (isPreviewing) {
        const bx = nx + r * 0.7;
        const by = ny - r * 0.7;
        const br = COMMIT_BUTTON_RADIUS;

        // Button circle
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = "#5B8DEF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // "+" text
        ctx.fillStyle = "#5B8DEF";
        ctx.font = "bold 16px 'Nunito', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("+", bx, by);
      }
    }

    ctx.globalAlpha = 1;
  }, [width, height, hoveredNodeId, previewingNodeId]);

  // Re-render on state changes + animation frame for preview glow
  useEffect(() => {
    if (!previewingNodeId) {
      render();
      return;
    }

    let rafId: number;
    function loop() {
      render();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [render, nodes, panOffset, previewingNodeId]);

  // Also render when not previewing
  useEffect(() => {
    if (previewingNodeId) return; // handled by rAF loop above
    render();
  }, [render, nodes, panOffset, previewingNodeId]);

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

  /** Check if click is on the "+" commit button of the previewing node */
  function isCommitButtonHit(mx: number, my: number): boolean {
    if (!previewingNodeId) return false;
    for (const node of nodesRef.current) {
      if (node.id !== previewingNodeId) continue;
      const x = node.x as number | undefined;
      const y = node.y as number | undefined;
      if (x == null || y == null) return false;

      // Use hover-scaled radius to match rendered position
      const isHovered = node.id === hoveredNodeId;
      const scale = isHovered ? 1.15 : 1;
      const r = node.radius * scale;
      const bx = x + r * 0.7;
      const by = y - r * 0.7;
      const dx = mx - bx;
      const dy = my - by;
      return dx * dx + dy * dy < COMMIT_BUTTON_RADIUS * COMMIT_BUTTON_RADIUS;
    }
    return false;
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!panEnabled) return;
      isDragging.current = true;
      didDrag.current = false;
      dragStart.current = {
        x: e.clientX - panOffsetRef.current.x,
        y: e.clientY - panOffsetRef.current.y,
      };
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

      // Check "+" commit button first (it's on top)
      if (isCommitButtonHit(mx, my) && previewingNodeId) {
        onCommit(previewingNodeId);
        return;
      }

      const nodeId = findNodeAt(mx, my);
      if (nodeId) {
        onNodeClick(nodeId);
      } else {
        // Click on empty canvas — dismiss preview
        onDismissPreview();
      }
    },
    [onNodeClick, onCommit, onDismissPreview, previewingNodeId],
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
