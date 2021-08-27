function getByName(colName, sheetName = null) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheetName) sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getRange("A1:1").getValues();
  var col = data[0].indexOf(colName);
  if (col != -1) {
    return sheet.getRange(2,col+1,sheet.getMaxRows());
  }
}

//https://gist.github.com/tanaikech/70503e0ea6998083fcb05c6d2a857107
String.prototype.addQuery = function(obj) {
  return this + Object.keys(obj).reduce(function(p, e, i) {
    return p + (i == 0 ? "?" : "&") +
      (Array.isArray(obj[e]) ? obj[e].reduce(function(str, f, j) {
        return str + e + "=" + encodeURIComponent(f) + (j != obj[e].length - 1 ? "&" : "")
      },"") : e + "=" + encodeURIComponent(obj[e]));
  },"");
}

function writeArrayToColumn(_array, _column = 2, _heading = 'Untitled') {
  var mainSheet = SpreadsheetApp.getActiveSheet()
  _array.unshift(_heading)
  var array = _array.map((el) => el ? [el] : [null]);
  var range = mainSheet.getRange(1, _column, array.length, 1)
  range.setValues(array)
}
