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
