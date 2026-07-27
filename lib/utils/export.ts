export function generateCSV(filename: string, headers: string[], rows: any[][]) {
  const processRow = (row: any[]) => {
    return row.map(val => {
      const str = String(val === null || val === undefined ? "" : val);
      // Escape quotes and wrap in quotes if contains comma, quotes, or newlines
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  };

  const csvContent = [
    processRow(headers),
    ...rows.map(processRow)
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
