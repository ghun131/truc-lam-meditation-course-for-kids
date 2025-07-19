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
  }

  return result;
}
