function doGet(e) {
  var ss = SpreadsheetApp.openById("1G39OJJWLsYsL0QicYFE9oYvnlBNzPsBux68e7v_zGzE");
  var startDate = e.parameter.startDate;
  var endDate = e.parameter.endDate;
  var dateDiff = parseInt(e.parameter.dateDiff); 
  var start_date_clean = Utilities.formatDate(new Date(startDate), ss.getSpreadsheetTimeZone(), "MM/dd/yyyy");
  var end_date_clean = Utilities.formatDate(new Date(endDate), ss.getSpreadsheetTimeZone(), "MM/dd/yyyy");
  var symbol = e.parameter.symbol;
  Logger.log('Symbol: ' + symbol);
  var sheet = ss.getSheetByName(symbol);

  
  if (sheet) {
    // Sheet already exists, use it
    targetSheet = sheet;
  
  } else {  
    // Sheet doesn't exist, create it
    targetSheet = ss.insertSheet(symbol);
  
  }
  var formulaRange = targetSheet.getRange("A1");
  startRange = formulaRange.offset(dateDiff, 0);
  var numRows = targetSheet.getMaxRows() - formulaRange.getRow() + 1; // Get the number of rows to clear
  var numColumns = targetSheet.getMaxColumns(); // Get the number of columns to clear
  var rangeToClear = targetSheet.getRange(formulaRange.getRow(), formulaRange.getColumn(), numRows, numColumns);
  
  rangeToClear.clearContent();
  formulaRange = targetSheet.getRange("A1");

  // close price
  var formula = '=GOOGLEFINANCE("' + symbol + '","price", "' + start_date_clean +'", "'+ end_date_clean + '","DAILY" )';
  // need to do offset for the other formulas
  formulaRange.setValue(formula);
  // Open
  formulaRange = formulaRange.offset(0, 2);   
  formula = '=GOOGLEFINANCE("' + symbol + '", "open", "' + start_date_clean +'", "'+ end_date_clean + '","DAILY" )';
  formulaRange.setValue(formula);
  //volume
  formulaRange = formulaRange.offset(0, 2);   
  formula = '=GOOGLEFINANCE("' + symbol + '", "volume", "' + start_date_clean +'", "'+ end_date_clean + '","DAILY" )';
  formulaRange.setValue(formula);
  //high
  formulaRange = formulaRange.offset(0, 2);   
  formula = '=GOOGLEFINANCE("' + symbol + '", "high", "' + start_date_clean +'", "'+ end_date_clean + '","DAILY" )';
  formulaRange.setValue(formula);
  //low
  formulaRange = formulaRange.offset(0, 2);   
  formula = '=GOOGLEFINANCE("' + symbol + '", "low", "' + start_date_clean +'", "'+ end_date_clean + '","DAILY" )';
  formulaRange.setValue(formula);
  
  var symbolColumn = formulaRange.offset(0, 2);
  symbolColumn.setValue("Symbol");
  symbolColumn.offset(1,0);
  while (symbolColumn.getValue() != "") {
    symbolColumn = symbolColumn.offset(1, 0);
    // symbolColumn.setValue(symbol);
  }
  // for now
  symbolColumn.setValue(symbol);
  // Move to the next cell 2 columns to the right
  formulaRange = formulaRange.offset(0, 3);
  // copy and paste values for everything in formulasheet
  
  range = targetSheet.getDataRange();
  range.copyTo(range, {contentsOnly: true});
  // delete extra date columns and copy symbol all the way down
  targetSheet.deleteColumn(3);
  targetSheet.deleteColumn(4);
  targetSheet.deleteColumn(5);
  targetSheet.deleteColumn(6);
  // change column A to datetime type and other columns to numbers
  var lastRow = targetSheet.getLastRow();
  targetSheet.getRange(1, 1, lastRow).setNumberFormat("yyyy-MM-dd HH:mm:ss");
  targetSheet.getRange(2, 2, lastRow).setNumberFormat("0.00");
  targetSheet.getRange(2, 3, lastRow).setNumberFormat("0.00");
  targetSheet.getRange(2, 4, lastRow).setNumberFormat("0.00");
  targetSheet.getRange(2, 5, lastRow).setNumberFormat("0.00");
  targetSheet.getRange(2, 6, lastRow).setNumberFormat("0.00");

  //copying symbol down 

  targetSheet.setActiveRange(targetSheet.getRange(2, 7, lastRow-1)).setValue(symbol);

  //need to refactor to adjust for each symbol
  //now do demark formulas
  var demark9SellRange = targetSheet.getRange("H1:H" + lastRow); // Set the range based on the last row
  
  // Hard code the first three rows
  demark9SellRange.getCell(1, 1).setValue("Demark 9 - Sell");
  demark9SellRange.getCell(2, 1).setValue(0);
  demark9SellRange.getCell(3, 1).setValue(0);
  
  // Insert your formula in the fourth row (H4)
  demark9SellRange.getCell(4, 1).setFormula("=IF(B4>B1, H3+1, 0)");
  
  // Copy down the formula for the defined range
  for (var i = 5; i <= lastRow; i++) {
    demark9SellRange.getCell(i, 1).setFormula("=IF(B" + (i + 1) + ">B" + (i - 3) + ", H" + (i - 1) + "+1, 0)");
  }

  var demark9perfectedSellRange = targetSheet.getRange("I1:I" + lastRow); // Set the range based on the last row
  
  // Hard code the first three rows
  demark9perfectedSellRange.getCell(1, 1).setValue("Demark 9 Sell Perfected Setup");
  demark9perfectedSellRange.getCell(2, 1).setValue(0);
  demark9perfectedSellRange.getCell(3, 1).setValue(0);
  
  // Insert your formula in the fourth row (H4)
  demark9perfectedSellRange.getCell(4, 1).setFormula("=if(OR(H4=9,COUNTIF(H4:H13, 9)>0),1,0)");
  
  // Copy down the formula for the defined range
  for (var i = 5; i <= lastRow; i++) {
    demark9perfectedSellRange.getCell(i, 1).setFormula("=IF(OR(H" + i + "=9,COUNTIF(H" + i + ":H" + (i + 9) + ", 9)>0),1,0)");
  }
  
  var demark13CountdownSell = targetSheet.getRange("J1:J" + lastRow); // Set the range for column J based on the last row

  // Hard code the first cell in column J
  demark13CountdownSell.getCell(1, 1).setValue("Demark 13 Countdown Sell");

  // Hard code 0's in cells 2-6 in column J
  for (var i = 2; i <= 6; i++) {
    demark13CountdownSell.getCell(i, 1).setValue(0);
  }

  // Insert your formula in cell 7 (J7)
  demark13CountdownSell.getCell(7, 1).setFormula("=IF(OR(IF(AND(H7=9,J6=0), 9 , IF(OR(J6>0,B7>B5),J6+1,J6))=14, AND(J6<>0,J6=J5,J5=J4,J4=J3,J3=J2,J2=J1)),0, IF(AND(H7=9,J6=0), 9 , IF(AND(J6>0,B7>B5),J6+1,J6)))");

  // Copy down the formula for the defined range in column J
  for (var i = 8; i <= lastRow; i++) {
    demark13CountdownSell.getCell(i, 1).setFormula("=IF(OR(IF(AND(H" + i + "=9,J" + (i - 1) + "=0), 9 , IF(OR(J" + (i - 1) + ">0,B" + i + ">B" + (i - 2) + "),J" + (i - 1) + "+1,J" + (i - 1) + "))=14, AND(J" + (i - 1) + "<>0,J" + (i - 1) + "=J" + (i - 2) + ",J" + (i - 2) + "=J" + (i - 3) + ",J" + (i - 3) + "=J" + (i - 4) + ",J" + (i - 4) + "=J" + (i - 5) + ",J" + (i - 5) + "=J" + (i - 6) + ")),0, IF(AND(H" + i + "=9,J" + (i - 1) + "=0), 9 , IF(AND(J" + (i - 1) + ">0,B" + i + ">B" + (i - 2) + "),J" + (i - 1) + "+1,J" + (i - 1) + ")))");
  }
  var demark9Buy = targetSheet.getRange("K1:K" + lastRow); // Set the range for column K based on the last row

  // Hard code the first cell in column K
  demark9Buy.getCell(1, 1).setValue("Demark 9 - Buy");

  // Hard code 0's in cells 2 and 3 in column K
  demark9Buy.getCell(2, 1).setValue(0);
  demark9Buy.getCell(3, 1).setValue(0);

  // Insert your formula in cell 4 (K4)
  demark9Buy.getCell(4, 1).setFormula("=IF(B4<B1, K3+1, 0)");

  // Copy down the formula for the defined range in column K
  for (var i = 5; i <= lastRow; i++) {
    demark9Buy.getCell(i, 1).setFormula("=IF(B" + i + "<B" + (i - 3) + ", K" + (i - 1) + "+1, 0)");
  }

  var demark9PerfectedBuyRange = targetSheet.getRange("L1:L" + lastRow); // Set the range for column L based on the last row

  // Hard code the first cell in column L
  demark9PerfectedBuyRange.getCell(1, 1).setValue("Your String");

  // Hard code 0's in cells 2 and 3 in column L
  demark9PerfectedBuyRange.getCell(2, 1).setValue(0);
  demark9PerfectedBuyRange.getCell(3, 1).setValue(0);

  // Insert your formula in cell 4 (L4)
  demark9PerfectedBuyRange.getCell(4, 1).setFormula("=IF(OR(K4=9,COUNTIF(K4:K13, 9)>0),1,0)");

  // Copy down the formula for the defined range in column L
  for (var i = 5; i <= lastRow; i++) {
    demark9PerfectedBuyRange.getCell(i, 1).setFormula("=IF(OR(K" + i + "=9,COUNTIF(K" + i + ":K" + (i + 9) + ", 9)>0),1,0)");
  }
  var demark13CountdownBuy = targetSheet.getRange("M1:M" + lastRow); // Set the range for column M based on the last row

  // Hard code the first cell in column M
  demark13CountdownBuy.getCell(1, 1).setValue("Demark 13 Countdown Buy");

  // Hard code 0's in cells 2-6 in column M
  for (var i = 2; i <= 6; i++) {
    demark13CountdownBuy.getCell(i, 1).setValue(0);
  }

  // Insert your formula in cell 7 (M7)
  demark13CountdownBuy.getCell(7, 1).setFormula("=IF(OR(IF(AND(K7=9,M6=0), 9 , IF(OR(M6>0,B7<B5),M6+1,M6))=14, AND(M6<>0,M6=M5,M5=M4,M4=M3,M3=M2,M2=M1)),0, IF(AND(K7=9,M6=0), 9 , IF(AND(M6>0,B7<B5),M6+1,M6)))");

  // Copy down the formula for the defined range in column M
  for (var i = 8; i <= lastRow; i++) {
    demark13CountdownBuy.getCell(i, 1).setFormula("=IF(OR(IF(AND(K" + i + "=9,M" + (i - 1) + "=0), 9 , IF(OR(M" + (i - 1) + ">0,B" + i + "<B" + (i - 2) + "),M" + (i - 1) + "+1,M" + (i - 1) + "))=14, AND(M" + (i - 1) + "<>0,M" + (i - 1) + "=M" + (i - 2) + ",M" + (i - 2) + "=M" + (i - 3) + ",M" + (i - 3) + "=M" + (i - 4) + ",M" + (i - 4) + "=M" + (i - 5) + ",M" + (i - 5) + "=M" + (i - 6) + ")),0, IF(AND(K" + i + "=9,M" + (i - 1) + "=0), 9 , IF(AND(M" + (i - 1) + ">0,B" + i + "<B" + (i - 2) + "),M" + (i - 1) + "+1,M" + (i - 1) + ")))");
  }
  
    var output = {
    status: "Success",
    symbol: symbol,
    startDate: start_date_clean,
    endDate: end_date_clean
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

