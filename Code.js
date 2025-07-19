function execMarkStudentCode() {
  const spreadsheetId = getSheetId();
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName("Lưu trữ");
  const mainSheet = ss.getSheetByName("Danh sách gửi mail");
  const mLastRow = mainSheet.getLastRow();
  const mLastCol = mainSheet.getLastColumn();
  const mainData = mainSheet.getRange(1, 1, mLastRow, mLastCol).getValues();

  const indexMap = getHeadersIndices(mainData[0]);

  const vehicleIdx = indexMap.get("vehicle");

  const sttIdx = indexMap.get("stt");
  const sttMarkedIdx = indexMap.get("sttMarkedIdx");
  const columnQ = mainSheet
    .getRange(1, sttMarkedIdx + 1, mLastRow, 1)
    .getValues();
  const columnJ = mainSheet
    .getRange(1, vehicleIdx + 1, mLastRow, 1)
    .getValues();

  const savedMap = getSavedData(mainSheet);

  const [tCountStr, tCountIdx] = savedMap.get("tCount");
  const [xCountStr, xCountIdx] = savedMap.get("xCount");
  const [tGroupStr, tGroupIdx] = savedMap.get("tGroup");
  const [xGroupStr, xGroupIdx] = savedMap.get("xGroup");

  if (
    [tCountStr, xCountStr, tGroupStr, xGroupStr].some(
      (val) => val === undefined
    )
  ) {
    throw new Error("Thiếu dữ liệu lưu trữ số thứ tự!");
  }

  let tCount = Number(tCountStr);
  let xCount = Number(xCountStr);
  let tGroup = Number(tGroupStr);
  let xGroup = Number(xGroupStr);

  const [totalSeats] = savedMap.get("totalSeats");

  if (totalSeats === undefined) throw new Error("Thieu tong so ghe tren xe!");

  // Process each row
  for (let i = 1; i < mLastRow; i++) {
    const value = columnJ[i][0];
    const execStatus = columnQ[i][0];

    if (execStatus === "x") {
      continue;
    }

    let code = "";

    if (value.toLowerCase().includes("tự túc phương tiện")) {
      tCount++;
      if (tCount > totalSeats) {
        tGroup++;
        tCount = 1;
      }
      code = `T${tGroup}.${tCount.toString().padStart(2, "0")}`;
    } else if (value.toLowerCase().includes("ô tô đoàn")) {
      xCount++;
      if (xCount > totalSeats) {
        xGroup++;
        xCount = 1;
      }
      code = `X${xGroup}.${xCount.toString().padStart(2, "0")}`;
    }
    console.log("execMarkStudentCode", code);
    mainSheet.getRange(i + 1, sttIdx + 1).setValue(code);
    mainSheet.getRange(i + 1, sttMarkedIdx + 1).setValue("x");
  }

  sheet.getRange(tCountIdx + 1, 2, 1, 1).setValue(tCount);
  sheet.getRange(xCountIdx + 1, 2, 1, 1).setValue(xCount);
  sheet.getRange(tGroupIdx + 1, 2, 1, 1).setValue(tGroup);
  sheet.getRange(xGroupIdx + 1, 2, 1, 1).setValue(xGroup);
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Tạo văn bản")
    .addItem("Bắt đầu", "execGenerateDocuments")
    .addToUi();
}

function execGenerateDocuments() {
  const spreadsheetId = getSheetId();
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const ui = SpreadsheetApp.getUi();
  const savingSheet = ss.getSheetByName("Lưu trữ");
  const savedValue = getSavedData(savingSheet);
  let [templateDocUrl, templateDocIdx] = savedValue.get("templateLink");

  const sheet = ss.getSheetByName("Danh sách gửi mail");

  let templatePrompt = null;
  if (!templateDocUrl || templateDocUrl === "null") {
    templatePrompt = ui.prompt(
      "Tạo văn bản",
      "Vui lòng nhập URL của Google Doc Template:",
      ui.ButtonSet.OK_CANCEL
    );
    templateDocUrl = templatePrompt.getResponseText();
    savingSheet.getRange(templateDocIdx + 1, 2).setValue(templateDocUrl);
  }
  if (
    templatePrompt &&
    templatePrompt.getSelectedButton() == ui.Button.CANCEL
  ) {
    ui.alert("Document generation cancelled.");
    return;
  }
  const templateId = extractIdFromUrl(templateDocUrl);
  if (!templateId) {
    ui.alert(
      "Lỗi",
      "URL của Google Doc Template không hợp lệ. Vui lòng đảm bảo nó là một URL hợp lệ của Google Docs.",
      ui.ButtonSet.OK
    );
    return;
  }

  let [outputFolderUrl, outputFolderIdx] = savedValue.get("folderLink");
  let outputFolderPrompt = null;
  if (!outputFolderUrl || outputFolderUrl === "null") {
    outputFolderPrompt = ui.prompt(
      "Tạo văn bản",
      "Vui lòng nhập URL của Google Drive Folder mà mới văn bản sẽ được lưu:",
      ui.ButtonSet.OK_CANCEL
    );
    outputFolderUrl = outputFolderPrompt.getResponseText();
    savingSheet.getRange(outputFolderIdx + 1, 2).setValue(outputFolderUrl);
  }
  if (
    outputFolderPrompt &&
    outputFolderPrompt.getSelectedButton() == ui.Button.CANCEL
  ) {
    ui.alert("Tạo văn bản đã bị hủy.");
    return;
  }
  const folderId = extractIdFromUrl(outputFolderUrl);
  if (!folderId) {
    ui.alert(
      "Lỗi",
      "URL của Google Drive Folder không hợp lệ. Vui lòng đảm bảo nó là một URL hợp lệ của Google Drive folder.",
      ui.ButtonSet.OK
    );
    return;
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues(); // Get all data, including headers
  const headers = values[0]; // First row is headers
  const data = values.slice(1); // Remaining rows are data
  const indices = getHeadersIndices(headers);

  if (data.length === 0) {
    ui.alert("Không có dữ liệu trong bảng để tạo văn bản.");
    return;
  }

  // --- Document Processing ---
  try {
    const outputFolder = DriveApp.getFolderById(folderId);

    const linkColumnHeader = "Generated Document Link";
    let linkColumnIndex = headers.indexOf(linkColumnHeader);
    if (linkColumnIndex === -1) {
      sheet.insertColumnAfter(sheet.getLastColumn());
      sheet.getRange(1, sheet.getLastColumn()).setValue(linkColumnHeader);
      linkColumnIndex = sheet.getLastColumn() - 1; // 0-indexed for array
      headers.push(linkColumnHeader); // Update headers array
    }

    ui.alert("Đang tạo văn bản. Chờ tí nhé...");
    let count = 0;

    const docCreationIdx = indices.get("docCreateIdx");
    const sttIdx = indices.get("stt");
    const studentIdx = indices.get("studentIdx");

    if (
      [docCreationIdx, sttIdx, studentIdx].some((item) => item === undefined)
    ) {
      throw new Error(
        "Không có cột Đã tạo đơn đăng ký hoặc cột STT hoặc cột Họ tên Thiền sinh"
      );
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const docName = row[sttIdx] + " - " + row[studentIdx];

      if (row[docCreationIdx] === "x") {
        continue;
      }

      // Create a copy of the template
      const newDocId = DriveApp.getFileById(templateId)
        .makeCopy(docName, outputFolder)
        .getId();
      const newDoc = DocumentApp.openById(newDocId);
      const body = newDoc.getBody();

      // Replace placeholders in the copied document
      for (let j = 0; j < headers.length; j++) {
        const placeholder = "<<" + headers[j] + ">>"; // Assuming placeholders are like <<HeaderName>>
        const replacement =
          row[j] !== undefined && row[j] !== null ? String(row[j]) : ""; // Ensure replacement is a string
        body.replaceText(placeholder, replacement);
      }

      newDoc.saveAndClose();

      count++;

      sheet.getRange(i + 2, linkColumnIndex + 1).setValue(newDoc.getUrl());
      sheet.getRange(i + 2, docCreationIdx + 1).setValue("x");
    }

    ui.alert(
      "Tạo văn bản hoàn tất!",
      "Đã tạo " + count + " văn bản.",
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert(
      "Lỗi rồi: " +
        e.message +
        "\n\nVui lòng đảm bảo bạn đã cấp quyền cần thiết và URL là chính xác."
    );
  }
}

function execSendMail() {
  const spreadsheetId = getSheetId();
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName("Danh sách gửi mail");
  const savingSheet = ss.getSheetByName("Lưu trữ");
  const savedValue = getSavedData(savingSheet);
  const [howToStayLink] = savedValue.get("howToStayLink");

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow === 0) {
    return;
  }

  const allData = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const indices = getHeadersIndices(allData[0]);
  const reportIdx = indices.get("report");

  if (reportIdx === undefined) {
    sheet.insertColumnsAfter(lastColumn, 1);
    sheet.getRange(1, lastColumn + 1).setValue("Thông báo");
    reportIdx = lastColumn + 1;
  }

  for (let row = 0; row < allData.length; row++) {
    if (row === 0) continue;

    const emails = indices.get("email");
    if (emails === undefined) {
      setRowBackgroundColor(sheet, "#ffdddd", row);
      sheet.getRange(row + 1, reportIdx + 1).setValue("Không có email!");
      continue;
    }

    const vehicleTypeIdx = indices.get("vehicle");
    const confirmMailSentIdx = indices.get("confirmMailSent");
    const paymentIdx = indices.get("payment");
    const genDocFileIdx = indices.get("genDocFile");

    const rowData = allData[row];
    const email = rowData.find(
      (item, index) =>
        emails.includes(index) &&
        item &&
        typeof item === "string" &&
        item.includes("@") &&
        item.includes(".")
    );
    const paidBusFee = paymentIdx !== undefined ? rowData[paymentIdx] : null;
    const vehicle =
      vehicleTypeIdx !== undefined ? rowData[vehicleTypeIdx] : null;
    const byBus = vehicle === "Đi ô tô đoàn 2 chiều" || vehicle === null;
    const confirmMailSent =
      confirmMailSentIdx !== undefined ? rowData[confirmMailSentIdx] : null;

    if (!email) {
      continue;
    }

    const docLink = rowData[genDocFileIdx];
    const successVerificationByBusMail = createSuccessVerificationByBusMail({
      docLink,
      howToStayLink,
    });
    const successVerificationOwnVehicleMail =
      createSuccessVerificationOwnVehicleMail({ docLink, howToStayLink });

    if (confirmMailSent !== "x" && paidBusFee === "x") {
      if (!docLink) {
        sheet
          .getRange(row + 1, reportIdx + 1)
          .setValue("Lỗi chưa tạo đơn file doc!");
        continue;
      }
      try {
        if (byBus) {
          GmailApp.sendEmail(email, successVerificationByBusMail.subject, "", {
            htmlBody: successVerificationByBusMail.content,
          });
          console.log(`Sent to ${email} mail by bus`);
        } else {
          GmailApp.sendEmail(
            email,
            successVerificationOwnVehicleMail.subject,
            "",
            { htmlBody: successVerificationOwnVehicleMail.content }
          );
          console.log(`Sent to ${email} mail own vehicle`);
        }

        sheet.getRange(row + 1, confirmMailSentIdx + 1).setValue("x");
        setRowBackgroundColor(sheet, "white", row);
        sheet.getRange(row + 1, reportIdx + 1).setValue("");
      } catch (error) {
        setRowBackgroundColor(sheet, "#FF8488", row);
        sheet.getRange(row + 1, reportIdx + 1).setValue("Lỗi mail xác nhận!");
        throw error;
      }
    }

    // Clean up errored row has been fixed
    const hasError =
      rowData[reportIdx] === "Lỗi mail xác nhận!" ||
      rowData[reportIdx] === "Không có email!";
    if (confirmMailSent && hasError) {
      setRowBackgroundColor(sheet, "white", row);
      sheet.getRange(row + 1, reportIdx + 1).setValue("");
    }
  }
}
