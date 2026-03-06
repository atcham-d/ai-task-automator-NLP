import {
    BaseEdge,
    getSmoothStepPath,
    type EdgeProps,
} from '@xyflow/react';

export default function AnimatedEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: '#6366f1',
                    strokeWidth: 2,
                    ...style,
                }}
            />
            <path
                d={edgePath}
                fill="none"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="8 4"
                style={{
                    animation: 'edgeFlow 1.5s linear infinite',
                }}
            />
            <style>{`
        @keyframes edgeFlow {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>
        </>
    );
}
