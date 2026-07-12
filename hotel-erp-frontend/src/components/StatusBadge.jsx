function StatusBadge({ status }) {
  const normalized = String(status || "UNKNOWN").toLowerCase().replaceAll("_", "-");
  return <span className={`status-badge status-${normalized}`}>{status || "UNKNOWN"}</span>;
}

export default StatusBadge;
