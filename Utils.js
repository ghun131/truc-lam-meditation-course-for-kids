/**
 * Helper function to extract the ID from a Google Drive/Docs URL.
 * @param {string} url The URL of the Google Doc or Google Drive folder.
 * @return {string|null} The ID of the document/folder, or null if not found.
 */
function extractIdFromUrl(url) {
  const match = url.match(/[-\w]{25,}/); // Regex to find Google Drive/Docs IDs
  return match ? match[0] : null;
}

function setRowBackgroundColor(sheet, color, row) {
  const rowRange = sheet.getRange(row + 1, 1, 1, sheet.getLastColumn());
  rowRange.setBackground(color);
}

/**
 * Clone all data and formatting from source sheet to target sheet
 * @param {Sheet} sourceSheet - The sheet to copy data from
 * @param {Sheet} targetSheet - The sheet to copy data to
 */
function cloneSheetData(sourceSheet, targetSheet) {
  // Clone all data from source sheet
  const sourceRange = sourceSheet.getDataRange();
  if (sourceRange.getNumRows() > 0) {
    const sourceData = sourceRange.getValues();
    const targetRange = targetSheet.getRange(1, 1, sourceData.length, sourceData[0].length);
    targetRange.setValues(sourceData);
    
    // Copy formatting from first row (headers)
    const sourceHeaderRange = sourceSheet.getRange(1, 1, 1, sourceData[0].length);
    const targetHeaderRange = targetSheet.getRange(1, 1, 1, sourceData[0].length);
    sourceHeaderRange.copyTo(targetHeaderRange);
    
    console.log(`Đã sao chép ${sourceData.length} hàng từ "${sourceSheet.getName()}" sang "${targetSheet.getName()}"`);
    return sourceData.length;
  }
  return 0;
}