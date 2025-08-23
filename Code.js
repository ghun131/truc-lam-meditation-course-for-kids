function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Khoá tu")
    .addItem("Tạo danh sách gửi mail", "initDanhSachGuiMailSheet")
    .addItem("Sync danh sách gửi mail", "syncDanhSachGuiMailSheet")
    .addItem("Đánh số thứ tự", "execMarkStudentCode")
    .addItem("Lọc trùng thiền sinh", "filterDuplicate")
    .addItem("Tạo đơn đăng ký", "execGenerateDocuments")
    .addToUi();

  ui.createMenu("Chạy chủ động")
    .addItem("Gửi mail xác nhận toàn bộ", "execSendMail")
    .addToUi();
}

// ------------ CREATE MENU FUNCTIONS ------------
function initDanhSachGuiMailSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Danh sách gửi mail");

  const sourceSheet = ss.getSheetByName("Câu trả lời biểu mẫu 1");
  if (!sourceSheet) {
    throw new Error(
      "Không tìm thấy sheet 'Câu trả lời biểu mẫu 1' để sao chép dữ liệu!"
    );
  }

  if (!sheet) {
    sheet = ss.insertSheet("Danh sách gửi mail");
    initLuuTruSheet(ss);
  }

  cloneSheetData(sourceSheet, sheet);

  const columns = [
    "Số thứ tự",
    "Đã đánh số thứ tự",
    "Đã tạo đơn đăng ký",
    "Generated Document Link",
    "Đã chuyển khoản",
    "Đã gửi mail đăng ký thành công",
    "Thông báo",
    "Note",
  ];

  const lastColumn = sheet.getLastColumn();
  let currentHeaders = [];
  if (lastColumn > 0) {
    currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  }

  const startColumn = lastColumn + 1;

  const headersToAdd = [];
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const exists = currentHeaders.some(
      (header) =>
        header && header.toString().toLowerCase() === column.toLowerCase()
    );

    if (!exists) {
      headersToAdd.push(column);
    }
  }

  if (headersToAdd.length > 0) {
    const headerRange = sheet.getRange(1, startColumn, 1, headersToAdd.length);
    headerRange.setValues([headersToAdd]);

    headerRange.setFontWeight("bold");
    headerRange.setFontColor("white");
    headerRange.setBackground("#5b3f86");
    headerRange.setBorder(true, true, true, true, true, true);

    for (let i = 0; i < headersToAdd.length; i++) {
      sheet.autoResizeColumn(startColumn + i);
    }

    console.log(
      `Added ${headersToAdd.length} new columns: ${headersToAdd.join(", ")}`
    );
  } else {
    console.log("All required columns already exist in the sheet.");
  }

  return sheet;
}

function initLuuTruSheet(ss) {
  const sheet = ss.insertSheet("Lưu trữ");

  // Define the data to populate (label, value)
  const data = [
    ["Số ghế trên xe", 18], // Row 0
    ["Nhóm tự túc", 1], // Row 1
    ["STT tự túc hiện tại", 0], // Row 2
    ["Nhóm xe đoàn", 1], // Row 3
    ["STT xe đoàn hiện tại", 0], // Row 4
    ["Đường link file doc mẫu đăng ký", ""], // Row 5
    ["Đường link folder lưu đơn đăng ký", ""], // Row 6
    [
      "Hướng dẫn lưu trú",
      "https://drive.google.com/file/d/1NDOjKjQPos0E0HT59FkHiUGAlXtjIDvc/view",
    ], // Row 7
    ["Năm", 2026], // Row 8
    ["Giới tính thiền sinh", "Nam"], // Row 9
    ["Độ tuổi", "2009-2012"], // Row 10
    ["Link nhóm Zalo", "https://www.google.com"], // Row 11
    ["Trực đường dây nóng 1", "Phật tử Diệu Từ"], // Row 12
    ["Số điện thoại đường dây nóng 1", "0988 237 713"], // Row 13
    ["Trực đường dây nóng 2", "Phật tử Chân Mỹ Nghiêm"], // Row 14
    ["Số điện thoại đường dây nóng 2", "0848 349 129"], // Row 15
    ["Thời gian tập trung xe đoàn", "8h30 - 11h30"], // Row 16
    ["Ngày tập trung xe đoàn", new Date(2026, 6, 5)], // Row 17 (July 5, 2026)
    ["Giờ kết khoá", "15h30"], // Row 18
    ["Ngày kết khoá", new Date(2026, 6, 8)], // Row 19 (July 8, 2026)
  ];

  // Set the data
  const range = sheet.getRange(1, 1, data.length, 2);
  range.setValues(data);

  // Format the header row if you want
  const headerRange = sheet.getRange(1, 1, data.length, 1);
  headerRange.setFontWeight("bold");

  // Auto-resize columns
  sheet.autoResizeColumns(1, 2);

  console.log("Lưu trữ sheet initialized with configuration data");

  return sheet;
}

function syncDanhSachGuiMailSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Danh sách gửi mail");
  const sourceSheet = ss.getSheetByName("Câu trả lời biểu mẫu 1");
  cloneSheetData(sourceSheet, sheet);
}

function filterDuplicate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Danh sách gửi mail");
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  const hIndice = getHeadersIndices(data[0]);

  const emailIdx = hIndice.get("email");
  const nameIdx = hIndice.get("studentIdx");
  const dobIdx = hIndice.get("dateOfBirth");
  const reportIdx = hIndice.get("report");
  const markedIdx = hIndice.get("sttMarkedIdx");
  const confirmMailSentIdx = hIndice.get("confirmMailSent");
  const docCreatedIdx = hIndice.get("docCreateIdx");

  let cache = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[emailIdx];
    const name = row[nameIdx];
    const dob = row[dobIdx];
    const studentObj = { idx: i, email, name, dob };
    if (Array.isArray(cache[email])) {
      cache[email].every(
        (item) => `${item.name}${item.dob}` !== `${name}{dob}`
      ) && cache[email].push(studentObj);
    } else {
      cache[email] = [studentObj];
    }
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[emailIdx];
    const name = row[nameIdx];
    const dob = row[dobIdx];
    const prevId = (name + dob.toString()).toLowerCase();

    if (cache[email] && cache[email].length > 0) {
      for (const item of cache[email]) {
        const currId = (item.name + item.dob.toString()).toLowerCase();

        if (prevId === currId && i < item.idx) {
          setRowBackgroundColor(sheet, "#F28C28", i);
          sheet
            .getRange(i + 1, reportIdx + 1)
            .setValue(`Trùng với ${item.name}`);
          markedIdx !== undefined &&
            sheet.getRange(i + 1, markedIdx + 1).setValue("x");
          confirmMailSentIdx !== undefined &&
            sheet.getRange(i + 1, confirmMailSentIdx + 1).setValue("x");
          docCreatedIdx !== undefined &&
            sheet.getRange(i + 1, docCreatedIdx + 1).setValue("x");

          console.log(`Dòng ${i + 1} trùng bạn ${item.name}, email: ${email}`);
        }
      }
    }
  }
}

// ------------ MAIN TASKS EXECUTION FUNCTIONS ------------

function execMarkStudentCode() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

  const savedMap = getSavedData(sheet);

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

function execGenerateDocuments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Danh sách gửi mail");
  const savingSheet = ss.getSheetByName("Lưu trữ");
  const savedValue = getSavedData(savingSheet);
  const [howToStayLink] = savedValue.get("howToStayLink");
  const [currentYear] = savedValue.get("currentYear");
  const [gender] = savedValue.get("gender");
  const [ageRange] = savedValue.get("ageRange");
  const [zaloLink] = savedValue.get("zaloLink");
  const [firstContactName] = savedValue.get("firstContactName");
  const [firstContactPhone] = savedValue.get("firstContactPhone");
  const [secondContactName] = savedValue.get("secondContactName");
  const [secondContactPhone] = savedValue.get("secondContactPhone");
  const [gatheringTimeRange] = savedValue.get("gatheringTimeRange");
  const [gatheringDate] = savedValue.get("gatheringDate");
  const [endTime] = savedValue.get("endTime");
  const [endDate] = savedValue.get("endDate");

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
    const mailObj = {
      docLink,
      howToStayLink,
      currentYear,
      gender,
      ageRange,
      zaloLink,
      firstContactName,
      firstContactPhone,
      secondContactName,
      secondContactPhone,
      gatheringTimeRange,
      gatheringDate: formatDate(gatheringDate),
      endTime,
      endDate: formatDate(endDate),
    };

    const successVerificationByBusMail =
      createSuccessVerificationByBusMail(mailObj);
    const successVerificationOwnVehicleMail =
      createSuccessVerificationOwnVehicleMail(mailObj);

    if (confirmMailSent !== "x") {
      if (!docLink) {
        sheet
          .getRange(row + 1, reportIdx + 1)
          .setValue("Lỗi chưa tạo đơn file doc!");
        continue;
      }
      try {
        if (byBus && !paidBusFee) return;
        if (byBus && paidBusFee === "x") {
          GmailApp.sendEmail(email, successVerificationByBusMail.subject, "", {
            htmlBody: successVerificationByBusMail.content,
          });
          console.log(`Sent to ${email} mail by bus`);
        }
        if (!byBus) {
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

// ------------ EMAIL TEMPLATE FUNCTIONS ------------

function createSuccessVerificationOwnVehicleMail(input) {
  const {
    docLink,
    howToStayLink,
    currentYear = new Date().getFullYear(),
    gender = "Nữ",
    ageRange = "2008-2010",
    zaloLink = "https://zalo.me/g/damelp785",
    firstContactName = "Phật tử Diệu Từ",
    firstContactPhone = "0988 237 713",
    secondContactName = "Phật tử Chân Mỹ Nghiêm",
    secondContactPhone = "0848 349 129",
    gatheringTimeRange = "7h30 - 9h30",
    gatheringDate = "5/7/2025",
    endTime = "16h30",
    endDate = "8/7/2025",
  } = input;
  return {
    subject: `Khóa tu mùa hè ${currentYear} tại Thiền viện Trúc Lâm Tây Thiên [Khoá ${ageRange}/${gender}]`,
    content: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận Đăng ký Khóa tu mùa hè Thiền viện Trúc Lâm Tây Thiên</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          /* Removed specific color for headings to keep default size/style */
          /* h1, h2, h3 {
            color: #0056b3;
          } */
          ul {
            list-style-type: disc;
            margin-left: 10px;
          }
          li {
            margin-bottom: 10px;
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .important-note {
            background-color: #fff3cd;
            border-left: 5px solid #ffc107;
            padding: 10px 15px;
            margin-top: 20px;
            margin-bottom: 20px;
            color: #664d03;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            text-align: center;
            font-size: 0.9em;
            color: #777777;
          }
        </style>
        </head>
        <body>
          <div class="container">
            <p>Kính chào quý Phụ huynh và các bạn thiền sinh,</p>
  
            <p>Đoàn Thanh Thiếu Niên Phật Tử Trúc Lâm Tây Thiên - Trân Nhân Tông xác nhận bạn đã <strong>đăng ký thành công</strong> tham gia Khóa tu mùa hè khóa 4 tại Thiền viện Trúc Lâm Tây Thiên.</p>
  
            <p>---</p>
  
            <h2>1. THÔNG TIN TẬP TRUNG VÀ DI CHUYỂN</h2>
  
            <h3>Đối với thiền sinh tự túc di chuyển lên thiền viện:</h3>
            <ul>
              <li><strong>Thời gian tập trung:</strong> từ ${gatheringTimeRange} sáng ngày ${gatheringDate}</li>
              <li><strong>Địa điểm:</strong> tại giảng đường A thiền viện</li>
            </ul>
  
            <p>---</p>
  
            <h2>2. THỜI GIAN KẾT THÚC KHÓA TU:</h2>
            <ul>
              <li>${endTime} ngày ${endDate} sẽ kết thúc lễ bế giảng</li>
              <li>Với thiền sinh tự túc phương tiện, quý phụ huynh đón con tại thiền viện sau ${endTime}</li>
            </ul>
  
            <p>---</p>
  
            <h2>3. CHUẨN BỊ HỒ SƠ:</h2>
            <ul>
              <li>Đơn đăng ký có chữ ký xác nhận của thiền sinh và phụ huynh. <a href="${docLink}" target="_blank">Link in đơn</a></li>
              <li>Bản photo căn cước công dân hoặc giấy khai sinh bản sao</li>
              <li>2 ảnh 3 x 4 của thiền sinh</li>
            </ul>
  
            <p>---</p>
  
            <h2>4. ĐĂNG KÝ LƯU TRÚ</h2>
            <p>Phụ huynh truy cập cổng điện tử <strong>VNeID</strong> để đăng ký tạm trú cho thiền sinh tại thiền viện trong thời gian diễn ra khóa tu.</p>
            <p><a href="${howToStayLink}" target="_blank">Video hướng dẫn cách đăng ký tạm trú</a></p>
            <p><strong>Nhóm Zalo Thiền sinh:</strong> <a href="${zaloLink}" target="_blank">${zaloLink}</a></p>
  
            <p>---</p>
  
            <h2>5. LƯU Ý</h2>
            <div class="important-note">
              <ul>
                <li>Khi có việc đột xuất không tham gia được khóa tu, mong bạn báo lại sớm để Ban tổ chức có thể kịp thời sắp xếp.</li>
                <li>Tịnh tài cúng dường là <strong>TÙY HỶ</strong> để tạo phước đức cho bản thân và trợ duyên cho Thiền Viện chi phí tổ chức khóa tu. Có thể cúng dường trực tiếp tại hòm công đức tại Thiền viện.</li>
              </ul>
            </div>
  
            <p>Mọi thông tin vui lòng liên hệ:</p>
            <ul>
              <li>1. ${firstContactName}: <strong>${firstContactPhone}</strong> (Thảo Mẫn);</li>
              <li>2. ${secondContactName}: <strong>${secondContactPhone}</strong></li>
            </ul>
  
            <p>Hẹn gặp quý phụ huynh và các bạn thiền sinh trong Khóa tu mùa hè ${currentYear}!</p>
  
            <p>Chúc quý vị một ngày an vui!</p>
  
            <p>Trân Trọng,</p>
            <p><strong>Đoàn Thanh Thiếu Niên Phật Tử Trúc Lâm Tây Thiên.</strong></p>
          </div>
        </body>
        </html>
      `,
  };
}

function createSuccessVerificationByBusMail(input) {
  const {
    docLink,
    howToStayLink,
    currentYear = new Date().getFullYear(),
    gender = "Nữ",
    ageRange = "2008-2010",
    zaloLink = "https://zalo.me/g/damelp785",
    firstContactName = "Phật tử Diệu Từ",
    firstContactPhone = "0988 237 713",
    secondContactName = "Phật tử Chân Mỹ Nghiêm",
    secondContactPhone = "0848 349 129",
    gatheringTimeRange = "7h30 - 9h30",
    gatheringDate = "5/7/2025",
    endTime = "16h30",
    endDate = "8/7/2025",
  } = input;
  return {
    subject: `Khóa tu mùa hè ${currentYear} tại Thiền viện Trúc Lâm Tây Thiên [Khoá ${ageRange}/${gender}]`,
    content: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận Đăng ký Khóa tu mùa hè Thiền viện Trúc Lâm Tây Thiên</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          /* Removed specific color for headings to keep default size/style */
          /* h1, h2, h3 {
            color: #0056b3;
          } */
          ul {
            list-style-type: disc;
            margin-left: 10px;
          }
          li {
            margin-bottom: 10px;
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .important-note {
            background-color: #fff3cd;
            border-left: 5px solid #ffc107;
            padding: 10px 15px;
            margin-top: 20px;
            margin-bottom: 20px;
            color: #664d03;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            text-align: center;
            font-size: 0.9em;
            color: #777777;
          }
        </style>
        </head>
        <body>
          <div class="container">
            <p>Kính chào quý Phụ huynh và các bạn thiền sinh,</p>
  
            <p>Đoàn Thanh Thiếu Niên Phật Tử Trúc Lâm Tây Thiên - Trân Nhân Tông xác nhận bạn đã <strong>đăng ký thành công</strong> tham gia Khóa tu mùa hè khóa 4 tại Thiền viện Trúc Lâm Tây Thiên.</p>
  
            <p>---</p>
  
            <h2>1. THÔNG TIN TẬP TRUNG VÀ DI CHUYỂN</h2>
  
            <h3>Đối với thiền sinh đi xe theo Đoàn từ Hà Nội:</h3>
            <ul>
              <li><strong>Thời gian tập trung:</strong> ${gatheringTimeRange} sáng ngày ${gatheringDate}</li>
              <li><strong>Địa điểm:</strong> cổng Đông Công viên Hòa Bình, đường Đỗ Nhuận, Bắc Từ Liêm, Hà Nội (Đối diện bệnh viện Mặt Trời - SunGroup). <a href="https://www.google.com/maps/search/?api=1&query=c%E1%BB%95ng+%C4%90%C3%B4ng+C%C3%B4ng+vi%C3%AAn+H%C3%B2a+B%C3%ACnh,+%C4%91%C6%B0%E1%BB%9Dng+%C4%90%E1%BB%97+Nhu%E1%BA%ADn,+B%E1%BA%AFc+T%E1%BB%AB+Li%C3%AAm,+H%C3%A0+N%E1%BB%99i" target="_blank">Định vị Google Maps</a></li>
              <li>Thiền sinh hoàn hỉ di chuyển tới địa điểm tập trung sớm hơn để tránh rơi vào tình trạng ùn tắc. Đoàn sẽ xuất phát theo đúng lịch trình và không chờ những trường hợp tới muộn.</li>
            </ul>
            <p>---</p>
            <h2>2. THỜI GIAN KẾT THÚC KHÓA TU:</h2>
            <ul>
              <li>${endTime} ngày ${endDate} sẽ kết thúc lễ bế giảng</li>
              <li>Với thiền sinh đi xe Đoàn, sẽ cập nhật giờ đón tại Hà Nội trong nhóm phụ huynh</li>
            </ul>
  
            <p>---</p>
  
            <h2>3. CHUẨN BỊ HỒ SƠ:</h2>
            <ul>
              <li>Đơn đăng ký có chữ ký xác nhận của thiền sinh và phụ huynh. <a href="${docLink}" target="_blank">Link in đơn</a></li>
              <li>Bản photo căn cước công dân hoặc giấy khai sinh bản sao</li>
              <li>2 ảnh 3 x 4 của thiền sinh</li>
            </ul>
  
            <p>---</p>
  
            <h2>4. ĐĂNG KÝ LƯU TRÚ</h2>
            <p>Phụ huynh truy cập cổng điện tử <strong>VNeID</strong> để đăng ký tạm trú cho thiền sinh tại thiền viện trong thời gian diễn ra khóa tu.</p>
            <p><a href="${howToStayLink}" target="_blank">Video hướng dẫn cách đăng ký tạm trú</a></p>
            <p><strong>Nhóm Zalo Thiền sinh:</strong> <a href="${zaloLink}" target="_blank">${zaloLink}</a></p>
  
            <p>---</p>
  
            <h2>5. LƯU Ý</h2>
            <div class="important-note">
              <ul>
                <li>Khi có việc đột xuất không tham gia được khóa tu, mong bạn báo lại sớm để Ban tổ chức có thể kịp thời sắp xếp.</li>
                <li>Tịnh tài cúng dường là <strong>TÙY HỶ</strong> để tạo phước đức cho bản thân và trợ duyên cho Thiền Viện chi phí tổ chức khóa tu. Có thể cúng dường trực tiếp tại hòm công đức tại Thiền viện.</li>
              </ul>
            </div>
  
            <p>Mọi thông tin vui lòng liên hệ:</p>
            <ul>
              <li>1. ${firstContactName}: <strong>${firstContactPhone}</strong></li>
              <li>2. ${secondContactName}: <strong>${secondContactPhone}</strong></li>
            </ul>
  
            <p>Hẹn gặp quý phụ huynh và các bạn thiền sinh trong Khóa tu mùa hè ${currentYear}!</p>
  
            <p>Chúc quý vị một ngày an vui!</p>
  
            <p>Trân Trọng,</p>
            <p><strong>Đoàn Thanh Thiếu Niên Phật Tử Trúc Lâm Tây Thiên.</strong></p>
          </div>
        </body>
        </html>
      `,
  };
}

// ------------ UTILITY FUNCTIONS ------------

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
    const targetRange = targetSheet.getRange(
      1,
      1,
      sourceData.length,
      sourceData[0].length
    );
    targetRange.setValues(sourceData);

    // Copy formatting from first row (headers)
    const sourceHeaderRange = sourceSheet.getRange(
      1,
      1,
      1,
      sourceData[0].length
    );
    const targetHeaderRange = targetSheet.getRange(
      1,
      1,
      1,
      sourceData[0].length
    );
    sourceHeaderRange.copyTo(targetHeaderRange);

    console.log(
      `Đã sao chép ${
        sourceData.length
      } hàng từ "${sourceSheet.getName()}" sang "${targetSheet.getName()}"`
    );
    return sourceData.length;
  }
  return 0;
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
// ------------ NAVIGATE FUNCTIONS ------------

function getSavedData(sheet) {
  const savedData = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues();

  const result = new Map([
    ["totalSeats", [savedData[0][1], 0]], // Số ghế trên xe
    ["xCount", [savedData[4][1], 4]], // STT xe đoàn hiện tại
    ["tCount", [savedData[2][1], 2]], // STT tự túc hiện tại
    ["xGroup", [savedData[3][1], 3]], // Nhóm xe đoàn
    ["tGroup", [savedData[1][1], 1]], // Nhóm tự túc
    ["templateLink", [savedData[5][1], 5]], // Đường link file doc mẫu đăng ký
    ["folderLink", [savedData[6][1], 6]], // Đường link folder lưu đơn đăng ký
    ["howToStayLink", [savedData[7][1], 7]], // Hướng dẫn lưu trú
    ["currentYear", [savedData[8][1], 8]], // Năm hiện tại
    ["gender", [savedData[9][1], 9]], // Giới tính
    ["ageRange", [savedData[10][1], 10]], // Năm sinh
    ["zaloLink", [savedData[11][1], 11]], // Nhóm Zalo
    ["firstContactName", [savedData[12][1], 12]], // Tên người liên hệ 1
    ["firstContactPhone", [savedData[13][1], 13]], // Số điện thoại 1
    ["secondContactName", [savedData[14][1], 14]], // Tên người liên hệ 2
    ["secondContactPhone", [savedData[15][1], 15]], // Số điện thoại 2
    ["gatheringTimeRange", [savedData[16][1], 16]], // Thời gian tập trung
    ["gatheringDate", [savedData[17][1], 17]], // Ngày tập trung
    ["endTime", [savedData[18][1], 18]], // Giờ kết khoá tu
    ["endDate", [savedData[19][1], 19]], // Ngày kết khoá tu
  ]);

  return result;
}

function getHeadersIndices(headerData) {
  const result = new Map();

  for (let i = 0; i < headerData.length; i++) {
    const header = headerData[i].toLowerCase();

    if (
      ["phương tiện", "cách thức", "hình thức"].some((val) =>
        header.includes(val)
      ) &&
      (header.includes("di chuyển") || header.includes("đi lại"))
    ) {
      result.set("vehicle", i);
    }

    if (header.includes("email")) {
      const currValue = result.get("email") || [];
      currValue.length > 0
        ? result.set("email", [i, ...currValue])
        : result.set("email", [i]);
    }

    if (header === "số thứ tự") {
      result.set("stt", i);
    }

    if (header === "đã đánh số thứ tự") {
      result.set("sttMarkedIdx", i);
    }

    if (header === "đã tạo đơn đăng ký") {
      result.set("docCreateIdx", i);
    }

    if (header === "họ tên thiền sinh") {
      result.set("studentIdx", i);
    }

    if (header.includes("đăng ký thành công")) {
      result.set("confirmMailSent", i);
    }

    if (header === "thông báo") {
      result.set("report", i);
    }

    if (
      header.includes("chuyển khoản") ||
      header.includes("thanh toán") ||
      header.includes("trả tiền")
    ) {
      result.set("payment", i);
    }

    if (header === "generated document link") {
      result.set("genDocFile", i);
    }

    if (header === "ghi chú") {
      result.set("note", i);
    }

    if (header === "ngày tháng năm sinh") {
      result.set("dateOfBirth", i);
    }
  }

  return result;
}
