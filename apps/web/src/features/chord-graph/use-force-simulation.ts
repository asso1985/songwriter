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
        requestAnimationFrame(animateFadeIn);
      }
    }

    requestAnimationFrame(animateFadeIn);

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [chords, relationships, width, height]);

  return nodes;
}
