import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";
import type { ChordEntry, ChordEdge } from "../../data/get-chords-by-key";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  name: string;
  type: ChordEntry["type"];
  distance: number;
  radius: number;
  opacity: number;
  /** 0-1 pulse phase for invitation glow on neighboring nodes. 0 = no pulse. */
  pulsePhase: number;
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  weight: number;
  label: string;
}

function getNodeRadius(distance: number): number {
  if (distance === 0) return 32;
  if (distance === 1) return 26;
  if (distance === 2) return 22;
  if (distance === 3) return 18;
  return 14;
}

export function useForceSimulation(
  chords: ChordEntry[],
  relationships: ChordEdge[],
  width: number,
  height: number,
) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  useEffect(() => {
    if (chords.length === 0 || width === 0 || height === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;

    const graphNodes: GraphNode[] = chords.map((chord) => ({
      id: chord.id,
      name: chord.name,
      type: chord.type,
      distance: chord.distance,
      radius: getNodeRadius(chord.distance),
      opacity: 0,
      pulsePhase: 0,
      x: centerX + (Math.random() - 0.5) * 50,
      y: centerY + (Math.random() - 0.5) * 50,
      ...(chord.distance === 0 ? { fx: centerX, fy: centerY } : {}),
    }));

    const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));

    const graphEdges: GraphEdge[] = relationships
      .filter((r) => nodeMap.has(r.source) && nodeMap.has(r.target))
      .map((r) => ({
        source: r.source,
        target: r.target,
        weight: r.weight,
        label: r.label,
      }));

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = d3.forceSimulation<GraphNode>(graphNodes)
      .force("center", d3.forceCenter<GraphNode>(centerX, centerY).strength(0.05))
      .force("charge", d3.forceManyBody<GraphNode>().strength(-200))
      .force(
        "link",
        d3.forceLink<GraphNode, GraphEdge>(graphEdges)
          .id((d) => d.id)
          .distance((d) => d.weight * 60 + 40),
      )
      .force("collide", d3.forceCollide<GraphNode>((d) => d.radius + 8))
      .alpha(1)
      .alphaDecay(0.02);

    simulationRef.current = simulation;

    simulation.on("tick", () => {
      setNodes([...graphNodes]);
    });

    // Staggered fade-in: animate opacity based on distance
    const fadeInDuration = 200;
    const maxDistance = Math.max(...chords.map((c) => c.distance));
    const startTime = performance.now();
    let fadeInRafId: number;
    let pulseRafId: number;

    function animateFadeIn() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / fadeInDuration, 1);

      for (const node of graphNodes) {
        const nodeDelay = maxDistance > 0 ? node.distance / maxDistance : 0;
        const nodeProgress = Math.max(0, (progress - nodeDelay * 0.5) / 0.5);
        node.opacity = Math.min(nodeProgress, 1);
      }

      setNodes([...graphNodes]);

      if (progress < 1) {
        fadeInRafId = requestAnimationFrame(animateFadeIn);
      } else {
        // Fade-in complete — start pulse on neighboring nodes (distance === 1)
        startPulse();
      }
    }

    // Subtle pulse animation on distance-1 nodes to invite first click
    const PULSE_DURATION = 3000; // pulse for 3 seconds then stop
    let pulseStart = 0;

    function animatePulse() {
      const elapsed = performance.now() - pulseStart;
      if (elapsed > PULSE_DURATION) {
        // Stop pulsing — reset all pulse phases
        for (const node of graphNodes) {
          node.pulsePhase = 0;
        }
        setNodes([...graphNodes]);
        return;
      }

      // Sine wave pulse: 0→1→0 over ~1.2s cycle
      const cycleMs = 1200;
      const phase = Math.sin((elapsed / cycleMs) * Math.PI * 2) * 0.5 + 0.5;

      for (const node of graphNodes) {
        node.pulsePhase = node.distance === 1 ? phase : 0;
      }

      setNodes([...graphNodes]);
      pulseRafId = requestAnimationFrame(animatePulse);
    }

    function startPulse() {
      pulseStart = performance.now();
      pulseRafId = requestAnimationFrame(animatePulse);
    }

    fadeInRafId = requestAnimationFrame(animateFadeIn);

    return () => {
      simulation.stop();
      simulationRef.current = null;
      cancelAnimationFrame(fadeInRafId);
      cancelAnimationFrame(pulseRafId);
    };
  }, [chords, relationships, width, height]);

  return nodes;
}
