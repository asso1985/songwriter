import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectHoveredNode, setHoveredNode, setSelectedNode } from "../../store/slices/graph-slice";
import { getChordsByKey } from "../../data/get-chords-by-key";
import { useForceSimulation } from "./use-force-simulation";
import GraphCanvas from "./graph-canvas";

interface ChordGraphProps {
  currentKey: string;
}

export default function ChordGraph({ currentKey }: ChordGraphProps) {
  const dispatch = useAppDispatch();
  const hoveredNodeId = useAppSelector(selectHoveredNode);
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

  const nodes = useForceSimulation(chords, relationships, size.width, size.height);

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

  if (!keyData) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <p>No chord data available for {currentKey}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full" data-testid="chord-graph">
      {size.width > 0 && size.height > 0 && (
        <GraphCanvas
          nodes={nodes}
          hoveredNodeId={hoveredNodeId}
          width={size.width}
          height={size.height}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}
