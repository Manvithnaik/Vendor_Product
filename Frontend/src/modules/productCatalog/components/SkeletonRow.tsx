import React from "react";

interface Props {
    cols?: number;
    rows?: number;
}

const pulse: React.CSSProperties = {
    background: "linear-gradient(90deg, #1e293b 25%, #273549 50%, #1e293b 75%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-pulse 1.4s ease-in-out infinite",
    borderRadius: "4px",
    height: "14px",
};

const SkeletonRow: React.FC<Props> = ({ cols = 8, rows = 6 }) => (
    <>
        <style>{`
      @keyframes skeleton-pulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
        {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #1e293b" }}>
                {Array.from({ length: cols }).map((_, ci) => (
                    <td key={ci} style={{ padding: "14px 12px" }}>
                        <div style={{ ...pulse, width: ci === 0 ? "60%" : ci === cols - 1 ? "40%" : "80%" }} />
                    </td>
                ))}
            </tr>
        ))}
    </>
);

export default SkeletonRow;
