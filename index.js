/*
Paste this script into the 'Code.gs' tab in the Script Editor
For a detailed explanation of this file, view 'form-script-commented.js'
*/

var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
  scriptProp.setProperty('folder', 'ID_FOLDER')
}

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    // Simpan file
    var kk = e.parameter.foto_kk
    var base64 = kk.replace(/^data.*;base64,/gim, "")
    var mimetype = kk.match(/(?<=data:).*?(?=;)/gim)?.[0]
    var decode = Utilities.base64Decode(base64, Utilities.Charset.UTF_8)
    var blob = Utilities.newBlob(decode, mimetype, "nama_file." + mimetype.split('/')[1])
    var file = DriveApp.getFolderById(scriptProp.getProperty('folder')).createFile(blob)
    delete e.parameter.foto_kk
    
    
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName(sheetName)

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}
