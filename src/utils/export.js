/**
 * Client-side utility to export JSON data to an Excel-compatible (.xls) spreadsheet
 * with styled table headers and visible gridlines.
 */
export function exportToExcel(data, fileName, headers) {
  // Build a standard Excel-compatible XML HTML table
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="utf-8" /><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet 1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
  html += '<body><table border="1" style="border-collapse: collapse;">';
  
  // Render Headers row
  html += '<tr>';
  headers.forEach(h => {
    html += `<th style="background-color: #f1f5f9; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1; text-align: left;">${h.label}</th>`;
  });
  html += '</tr>';
  
  // Render Data rows
  data.forEach(item => {
    html += '<tr>';
    headers.forEach(h => {
      let val = item[h.key];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof h.render === 'function') {
        // Fallback if formatting is needed
        val = h.render(item);
      }
      html += `<td style="padding: 6px; border: 1px solid #e2e8f0; text-align: left;">${String(val)}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</table></body></html>';
  
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
