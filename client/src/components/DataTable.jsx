import React from 'react';
import { TableSkeleton } from './Skeleton';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns,
  data = [],
  keyField = '_id',
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
}) => {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-5 py-3.5 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] || rowIdx}
              className="hover:bg-slate-50/60 transition"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-5 py-4 align-middle ${col.cellClassName || ''}`}
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
