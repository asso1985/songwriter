import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectHoveredNode,
  selectViewMode,
  setHoveredNode,
  setSelectedNode,
  setViewMode,
} from "../../store/slices/graph-slice";
import { getChordsByKey } from "../../data/get-chords-by-key";
import { useForceSimulation, type GraphNode } from "./use-force-simulation";
import GraphCanvas from "./graph-canvas";
import ZoomControls from "./zoom-controls";

const ZOOM_IN_MAX_DISTANCE = 1;
const ZOOM_IN_SCALE_FACTOR = 1.5;

interface ChordGraphProps {
  currentKey: string;
}

export default function ChordGraph({ currentKey }: ChordGraphProps) {
  const dispatch = useAppDispatch();
  const hoveredNodeId = useAppSelector(selectHoveredNode);
  const viewMode = useAppSelector(selectViewMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const keyData = getChordsByKey(currentKey);
  const chords = keyData?.chords ?? [];
  const relationships = keyData?.relationships ?? [];

  const allNodes = useForceSimulation(chords, relationships, size.width, size.height);

  // Filter and scale nodes based on viewMode
  const visibleNodes: GraphNode[] = useMemo(() => {
    if (viewMode === "zoomed-out") {
      return allNodes;
    }

    // Zoomed in: only show close nodes, scaled up
    return allNodes.map((node) => {
      if (node.distance <= ZOOM_IN_MAX_DISTANCE) {
        return {
          ...node,
          radius: node.radius * ZOOM_IN_SCALE_FACTOR,
        };
      }
      return { ...node, opacity: 0 };
    });
  }, [allNodes, viewMode]);

  const handleNodeHover = useCallback(
    (nodeId: string | null) => {
      dispatch(setHoveredNode(nodeId));
    },
    [dispatch],
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      dispatch(setSelectedNode(nodeId));
    },
    [dispatch],
  );

  // Keyboard shortcuts for zoom
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        dispatch(setViewMode("zoomed-in"));
      } else if (e.key === "-") {
        e.preventDefault();
        dispatch(setViewMode("zoomed-out"));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  if (!keyData) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <p>No chord data available for {currentKey}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full" data-testid="chord-graph">
      {size.width > 0 && size.height > 0 && (
        <GraphCanvas
          nodes={visibleNodes}
          hoveredNodeId={hoveredNodeId}
          width={size.width}
          height={size.height}
          panEnabled={viewMode === "zoomed-out"}
          currentKey={currentKey}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
        />
      )}
      <ZoomControls />
    </div>
  );
}
