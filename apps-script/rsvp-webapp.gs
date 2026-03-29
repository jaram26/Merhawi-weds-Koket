/**
 * Paste into the Google Sheet–bound project: Extensions → Apps Script
 * Deploy → Web app → Execute as: Me, Who has access: Anyone → New version after edits
 */
function doPost(e) {
  try {
    var body = {};
    var ct = (e.postData && e.postData.type) || '';

    if (ct.indexOf('application/json') !== -1 && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      body = {
        name: e.parameter.name || '',
        attendance: e.parameter.attendance || '',
        guests: e.parameter.guests !== undefined ? e.parameter.guests : '',
        message: e.parameter.message || '',
      };
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(),
      body.name || '',
      body.attendance || '',
      body.guests !== null && body.guests !== '' ? body.guests : '',
      body.message || '',
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

function doGet() {
  return ContentService.createTextOutput('RSVP endpoint — submit from the wedding site form.');
}
