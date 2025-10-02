import type { Table as ReactTable } from '@tanstack/react-table';

export const exportToCSV = async <TData,>(
  table: ReactTable<TData>,
  filename: string,
  title?: string
) => {
  const Papa = (await import('papaparse')).default;
  const rows = table.getRowModel().rows;
  const headers = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== 'select' && col.id !== 'actions')
    .map((col) =>
      (col.columnDef.meta as any)?.title || col.id
    );
  const data = rows.map((row) =>
    table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== 'select' && col.id !== 'actions')
      .reduce((acc, col) => {
        let value;
        try {
          value = row.getValue(col.id);
        } catch (error) {
          // If getValue fails, try to get the value from original data
          const original = row.original as any;
          const accessor = (col.columnDef as any)?.accessorKey;
          value = accessor ? original[accessor] : undefined;
        }

        const header = (col.columnDef.meta as any)?.title || col.id;
        acc[header] = typeof value === 'string' || typeof value === 'number'
          ? value
          : value instanceof Date
          ? value.toISOString().split('T')[0]
          : String(value || '');
        return acc;
      }, {} as Record<string, any>)
  );

  const csv = Papa.unparse({ fields: headers, data });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = async <TData,>(
  table: ReactTable<TData>,
  filename: string,
  title?: string
) => {
  const XLSX = await import('xlsx');
  const rows = table.getRowModel().rows;
  const headers = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== 'select' && col.id !== 'actions')
    .map((col) =>
      (col.columnDef.meta as any)?.title || col.id
    );

  const data = rows.map((row) =>
    table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== 'select' && col.id !== 'actions')
      .reduce((acc, col) => {
        let value;
        try {
          value = row.getValue(col.id);
        } catch (error) {
          // If getValue fails, try to get the value from original data
          const original = row.original as any;
          const accessor = (col.columnDef as any)?.accessorKey;
          value = accessor ? original[accessor] : undefined;
        }

        const header = (col.columnDef.meta as any)?.title || col.id;
        acc[header] = typeof value === 'string' || typeof value === 'number'
          ? value
          : value instanceof Date
          ? value.toISOString().split('T')[0]
          : String(value || '');
        return acc;
      }, {} as Record<string, any>)
  );

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};