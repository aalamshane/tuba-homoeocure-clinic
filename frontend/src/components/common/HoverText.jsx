import { truncateText } from "../../utils/formatters";

export default function HoverText({ value, maxLength }) {
  const text = value || "-";

  return (
    <span className="truncate-text" title={text}>
      {truncateText(text, maxLength)}
    </span>
  );
}
