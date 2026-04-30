export default function DataTable({
  title,
  columns,
  rows,
  query,
  page,
  size,
  totalItems,
  totalPages,
  loading,
  searchPlaceholder,
  onSearchChange,
  onPageChange,
  onSizeChange,
  sortBy,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
  showActions = true
}) {
  const columnCount = columns.length + (showActions ? 1 : 0);
  const startIndex = rows.length === 0 ? 0 : (page - 1) * size + 1;
  const endIndex = rows.length === 0 ? 0 : startIndex + rows.length - 1;

  function toggleSort(column) {
    if (!column.sortKey || !onSortChange) {
      return;
    }

    const nextDirection = sortBy === column.sortKey && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(column.sortKey, nextDirection);
  }

  function getSortIndicator(column) {
    if (!column.sortKey || sortBy !== column.sortKey) {
      return "";
    }

    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <input
          className="table-search"
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <select className="table-size" value={size} onChange={(event) => onSizeChange(Number(event.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.sortKey ? (
                  <button type="button" className="sort-button" onClick={() => toggleSort(column)}>
                    {column.label}
                    <span>{getSortIndicator(column)}</span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {showActions ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columnCount} className="empty-state">
                Loading records...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="empty-state">
                {query ? "No matching records found." : "No records yet."}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key] || "-"}
                  </td>
                ))}
                {showActions ? (
                  <td className="action-cell">
                    <button type="button" className="edit-button" onClick={() => onEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="danger-button" onClick={() => onDelete(row)}>
                      Delete
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="table-footer">
        <p>
          {totalItems === 0 ? `No ${title.toLowerCase()} to show` : `Showing ${startIndex}-${endIndex} of ${totalItems}`}
        </p>
        <div className="pagination">
          <button type="button" className="ghost-button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" className="ghost-button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
