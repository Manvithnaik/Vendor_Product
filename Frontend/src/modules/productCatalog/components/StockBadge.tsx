import React from "react";

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

const config: Record<StockStatus, { label: string; style: React.CSSProperties }> = {
    IN_STOCK: {
        label: "In Stock",
        style: { backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    },
    LOW_STOCK: {
        label: "Low Stock",
        style: { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    },
    OUT_OF_STOCK: {
        label: "Out of Stock",
        style: { backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    },
};

interface Props {
    status: StockStatus;
}

const StockBadge: React.FC<Props> = ({ status }) => {
    const { label, style } = config[status] ?? config.OUT_OF_STOCK;
    return (
        <span
            style={{
                ...style,
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                display: "inline-block",
            }}
        >
            {label}
        </span>
    );
};

export default StockBadge;
