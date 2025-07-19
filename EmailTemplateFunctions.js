function createSuccessVerificationOwnVehicleMail(input) {
  const { docLink, howToStayLink } = input;
  return {
    subject:
      "Khóa tu mùa hè 2025 tại Thiền viện Trúc Lâm Tây Thiên [Khoá 4/ Nữ 2008-2010]",
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
              <li><strong>Thời gian tập trung:</strong> từ 7h30 đến 9h30 sáng ngày 5/7/2025</li>
              <li><strong>Địa điểm:</strong> tại giảng đường A thiền viện</li>
            </ul>
  
            <p>---</p>
  
            <h2>2. THỜI GIAN KẾT THÚC KHÓA TU:</h2>
            <ul>
              <li>16h30 ngày 8/7/2025 sẽ kết thúc lễ bế giảng</li>
              <li>Với thiền sinh đi xe Đoàn, sẽ cập nhật giờ đón tại Hà Nội trong nhóm phụ huynh</li>
              <li>Với thiền sinh tự túc phương tiện, quý phụ huynh đón con tại thiền viện sau 16h30</li>
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
            <p>Phụ huynh truy cập cổng điện tử <strong>VNeID</strong> để đăng ký tạm trú cho thiền sinh tại thiền viện trong thời gian diễn ra khóa tu. (Từ 0h00 ngày 05/7/2025)</p>
            <p><a href="${howToStayLink}" target="_blank">Video hướng dẫn cách đăng ký tạm trú</a></p>
            <p><strong>Nhóm Zalo Thiền sinh:</strong> <a href="https://zalo.me/g/damelp785" target="_blank">https://zalo.me/g/damelp785</a></p>
  
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
              <li>1. Phật tử Diệu Từ: <strong>0988 237 713</strong> (Thảo Mẫn);</li>
              <li>2. Phật tử Chân Mỹ Nghiêm: <strong>0848 349 129</strong></li>
            </ul>
  
            <p>Hẹn gặp quý phụ huynh và các bạn thiền sinh trong Khóa tu mùa hè 2025!</p>
  
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
  const { docLink, howToStayLink } = input;
  return {
    subject:
      "Khóa tu mùa hè 2025 tại Thiền viện Trúc Lâm Tây Thiên [Khoá 4/ Nữ 2008-2010]",
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
              <li><strong>Thời gian tập trung:</strong> 06h00 ngày 5/7/2025</li>
              <li><strong>Địa điểm:</strong> cổng Đông Công viên Hòa Bình, đường Đỗ Nhuận, Bắc Từ Liêm, Hà Nội (Đối diện bệnh viện Mặt Trời - SunGroup). <a href="https://www.google.com/maps/search/?api=1&query=c%E1%BB%95ng+%C4%90%C3%B4ng+C%C3%B4ng+vi%C3%AAn+H%C3%B2a+B%C3%ACnh,+%C4%91%C6%B0%E1%BB%9Dng+%C4%90%E1%BB%97+Nhu%E1%BA%ADn,+B%E1%BA%AFc+T%E1%BB%AB+Li%C3%AAm,+H%C3%A0+N%E1%BB%99i" target="_blank">Định vị Google Maps</a></li>
              <li>Thiền sinh hoàn hỉ di chuyển tới địa điểm tập trung sớm hơn để tránh rơi vào tình trạng ùn tắc. Đoàn sẽ xuất phát theo đúng lịch trình và không chờ những trường hợp tới muộn.</li>
            </ul>
            <p>---</p>
            <h2>2. THỜI GIAN KẾT THÚC KHÓA TU:</h2>
            <ul>
              <li>16h30 ngày 8/7/2025 sẽ kết thúc lễ bế giảng</li>
              <li>Với thiền sinh đi xe Đoàn, sẽ cập nhật giờ đón tại Hà Nội trong nhóm phụ huynh</li>
              <li>Với thiền sinh tự túc phương tiện, quý phụ huynh đón con tại thiền viện sau 16h30</li>
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
            <p>Phụ huynh truy cập cổng điện tử <strong>VNeID</strong> để đăng ký tạm trú cho thiền sinh tại thiền viện trong thời gian diễn ra khóa tu. (Từ 0h00 ngày 05/7/2025)</p>
            <p><a href="${howToStayLink}" target="_blank">Video hướng dẫn cách đăng ký tạm trú</a></p>
            <p><strong>Nhóm Zalo Thiền sinh:</strong> <a href="https://zalo.me/g/damelp785" target="_blank">https://zalo.me/g/damelp785</a></p>
  
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
              <li>1. Phật tử Diệu Từ: <strong>0988 237 713</strong> (Thảo Mẫn);</li>
              <li>2. Phật tử Chân Mỹ Nghiêm: <strong>0848 349 129</strong></li>
            </ul>
  
            <p>Hẹn gặp quý phụ huynh và các bạn thiền sinh trong Khóa tu mùa hè 2025!</p>
  
            <p>Chúc quý vị một ngày an vui!</p>
  
            <p>Trân Trọng,</p>
            <p><strong>Đoàn Thanh Thiếu Niên Phật Tử Trúc Lâm Tây Thiên.</strong></p>
          </div>
        </body>
        </html>
      `,
  };
}
