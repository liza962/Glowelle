import { Dropdown } from "react-bootstrap";
import {
  ADMIN_STATUSES,
  statusBadgeBg,
  statusLabel,
} from "../constants/adminStatus.js";

export default function AdminStatusDropdown({
  status,
  onSelect,
  disabled = false,
  ariaLabel = "Change status",
}) {
  const s = status ?? "pending";

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant={statusBadgeBg(s)}
        size="sm"
        disabled={disabled}
        className="admin-status-dropdown-toggle"
        aria-label={ariaLabel}
      >
        {statusLabel(s)}
      </Dropdown.Toggle>
      <Dropdown.Menu align="end">
        {ADMIN_STATUSES.map((opt) => (
          <Dropdown.Item
            key={opt}
            active={opt === s}
            onClick={() => {
              if (opt !== s) onSelect(opt);
            }}
          >
            {statusLabel(opt)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
