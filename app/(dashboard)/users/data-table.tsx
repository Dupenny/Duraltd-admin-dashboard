"use client";
// TanStack Table wrapper — wire in real @tanstack/react-table for production
// npm install @tanstack/react-table

interface Column<T> { key: keyof T; label: string; render?: (val: T[keyof T], row: T) => React.ReactNode; }
interface DataTableProps<T> { data: T[]; columns: Column<T>[]; pageSize?: number; }

export function DataTable<T extends Record<string, unknown>>({ data, columns, pageSize = 10 }: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="data-tbl">
        <thead>
          <tr>{columns.map(c => <th key={String(c.key)}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.slice(0, pageSize).map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={String(c.key)}>
                  {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
