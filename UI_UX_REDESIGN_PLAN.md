# Nhà Nét — Đặc tả thiết kế lại UI/UX cho môi giới bất động sản

> Phiên bản 2.0 · 09/09/2026. Thay thế hoàn toàn kế hoạch cửa hàng bán lẻ trước đây.
> Phạm vi lần này: thiết kế và kế hoạch bàn giao bằng Markdown. Không viết code, không thay đổi app hoặc dịch vụ.

## 1. Định nghĩa sản phẩm

Nhà Nét là không gian làm việc trên điện thoại giúp môi giới quản lý bất động sản, chuẩn bị ảnh/video, tạo nội dung với AI, xuất bản lên các kênh mạng xã hội và xử lý sự quan tâm của khách.

Người dùng chính là môi giới cá nhân tại Việt Nam; nhóm nhỏ hoặc sàn là hướng mở rộng. Họ thường làm việc ngoài hiện trường, cần nhập nhanh bằng một tay, có thể gặp mạng yếu và thường quay lại hoàn thiện nội dung sau.

Đã xác nhận định hướng nghiệp vụ từ cuộc trao đổi và cấu trúc app được xem ở lượt trước. Đây là bản thiết kế đích, không phải báo cáo kiểm kê tính năng. Tính năng đề xuất cần được đối chiếu với khả năng hiện có khi triển khai.

**Lời hứa sản phẩm:** “Từ bất động sản đến bài đăng chỉn chu, trong một nơi.”

**Ba công việc quan trọng nhất:**

1. Lưu thông tin và hình ảnh một bất động sản mà không mất dữ liệu.
2. Tạo, duyệt và đưa đúng nội dung đến đúng tài khoản/kênh.
3. Biết bài nào đã đăng, bài nào cần xử lý và khách nào cần phản hồi.

**Nguyên tắc chọn tính năng:** giúp môi giới hoàn thành công việc nhanh, chính xác và có thể kiểm soát. Không dùng số liệu giả, lời hứa AI quá mức hoặc danh sách mạng xã hội dài để tạo cảm giác sản phẩm mạnh hơn thực tế.

## 2. Hướng mỹ thuật: studio bất động sản hiện đại

### 2.1 Cảm giác tổng thể

Thiết kế như một studio làm nội dung chuyên nghiệp kết hợp công cụ quản lý công việc: ảnh bất động sản đẹp và lớn, bố cục thoáng, chữ rõ, trạng thái xuất bản đáng tin.

- Nền trắng ngà pha xanh nhẹ, bề mặt trắng, chữ đen xanh.
- Xanh rừng là màu hành động chủ đạo; màu đồng ấm chỉ dùng cho điểm nhấn biên tập hoặc công cụ AI.
- Ảnh nhà là yếu tố giàu cảm xúc. Bề mặt thao tác giữ đơn giản để ảnh nổi bật.
- Tiêu đề có cá tính nhưng ngắn; dữ liệu và form ưu tiên dễ đọc.
- Card được phân tách bằng khoảng cách và đường viền nhẹ. Bóng chỉ dùng ở lớp nổi.
- Không phủ gradient hoặc hiệu ứng kính trên mọi màn. Không dùng ảnh nhà mẫu như tài sản thật của người dùng.
- Không biến trang chủ thành bảng điều khiển dày đặc số liệu nhỏ.

**Điểm nhận diện riêng:** biểu tượng khung nhà nét mảnh kết hợp góc khung ảnh; các đường căn ảnh và thumbnail nội dung tạo liên tưởng đến studio. Đây là định hướng nhận diện, không yêu cầu thay logo khi chưa có bộ nhận diện cuối.

### 2.2 Những thay đổi thị giác phải thấy rõ

| Thành phần | Thiết kế đích |
|---|---|
| Trang chủ | Lời chào gọn, CTA tạo tin, công việc cần làm và tin gần đây |
| Danh sách tài sản | Ảnh 4:3 lớn, giá rõ, trạng thái tài sản và trạng thái đăng tách biệt |
| Tạo nội dung | Trình tự từng bước rõ, bản nháp được lưu, lựa chọn phụ được thu gọn |
| Chọn kênh | Tên tài khoản cụ thể, phương thức đăng và giới hạn khả dụng nhìn thấy trước |
| Kết quả đăng | Kết quả theo từng kênh, có thể thành công một phần |
| Tin nhắn | Ưu tiên khách chưa phản hồi, nội dung gần nhất, thời gian và nguồn |
| Báo cáo | Chỉ số có nguồn, khoảng thời gian và thời điểm cập nhật |

## 3. Design system

### 3.1 Màu sắc

| Token | Mã màu | Cách dùng |
|---|---|---|
| background | #F7F8F5 | Nền màn hình |
| surface | #FFFFFF | Card, input, sheet |
| surface-subtle | #EEF2EE | Vùng ảnh thiếu, nhóm phụ |
| text-primary | #17211B | Tiêu đề, số tiền, nội dung |
| text-secondary | #526158 | Mô tả, thời gian, nhãn phụ |
| brand | #174D38 | CTA chính, lựa chọn hiện tại |
| brand-pressed | #103A2A | Trạng thái nhấn |
| brand-soft | #E6F0E9 | Nền lựa chọn, icon phụ |
| accent | #8A562E | Điểm nhấn công cụ AI |
| accent-soft | #F4EBDD | Nền khối AI |
| border-subtle | #DDE4DD | Phân cách trang trí |
| border-control | #7A887E | Biên điều khiển cần nhận biết rõ |
| success | #20623D | Thành công |
| warning | #825500 | Cần chú ý |
| error | #B42318 | Lỗi |
| error-soft | #FCEDEA | Nền thông báo lỗi |
| disabled-background | #E5E9E5 | Nền vô hiệu hóa |
| disabled-text | #66736B | Nhãn vô hiệu hóa |

Màu nền tảng mạng xã hội chỉ dùng trong dấu nhận diện của nền tảng. Không đổi toàn bộ màn theo Facebook/Zalo. Mọi trạng thái phải có chữ hoặc icon đi kèm màu.

### 3.2 Typography

Dùng **Be Vietnam Pro** xuyên suốt để tận dụng khả năng hiển thị tiếng Việt và tạo nhận diện. Font hệ thống là fallback. Không dùng font monospace cho giá hoặc số liệu lớn; chỉ dùng nếu cần hiển thị mã kỹ thuật trong màn hỗ trợ.

| Vai trò | Cỡ / dòng | Độ đậm |
|---|---|---|
| Tiêu đề nổi bật | 30 / 38 | Bold |
| Tiêu đề màn hình | 26 / 34 | Bold |
| Tiêu đề khối | 20 / 28 | Semibold |
| Giá tài sản | 28 / 36 | Bold |
| Nội dung / input | 16 / 24 | Regular |
| Tên tài sản trong card | 16 / 22 | Semibold |
| Nút | 16 / 22 | Semibold |
| Nhãn phụ | 13 / 18 | Medium |
| Tab | 12 / 16 | Medium |

Không viết hoa các đoạn dài. Tên tài sản trong card tối đa hai dòng, trang chi tiết hiện đầy đủ. Giá tham chiếu: “2,8 tỷ”, “18 triệu/tháng”; form có đơn vị tách riêng. Không gắn “tỷ” cho một giá trị mà chưa biết đơn vị nhập.

### 3.3 Kích thước và khoảng cách

- Frame tham chiếu: 390 × 844 đơn vị logic, không phải pixel vật lý.
- Lề ngang: 20; dưới 360 dùng 16. Khoảng giữa khối 28–32; giữa nhãn và trường 8.
- Thang khoảng cách: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Nút chính và input cao tối thiểu 52; icon có vùng chạm tối thiểu 48 × 48.
- Bo góc: nút/input 12; card và ảnh 16; khối chủ đạo 20; sheet 24.
- Icon cùng một bộ nét 22–24, độ dày nhất quán. Không trộn emoji vào điều hướng.
- Footer hành động: nền trắng, đường viền trên nhẹ, đệm ngang 20, đệm dưới theo safe area.
- Thanh tab: phần nội dung tối thiểu 64 cộng safe area, không đặt chiều cao cố định bỏ qua thiết bị.
- Ảnh tài sản mặc định 4:3; ảnh bìa nội dung có thể 1:1, 4:5 hoặc 9:16 theo định dạng đã chọn.
- Skeleton giữ đúng tỷ lệ ảnh và độ cao dự kiến, không làm màn nhảy khi tải xong.

### 3.4 Bộ component phải bàn giao

Button; icon button; search field; labeled input; unit input; segmented control; filter chip; status chip; property card; publication row; channel selector; media tile; progress stepper; message row; timeline item; metric card; bottom sheet; snackbar; inline error; skeleton; empty state.

Mỗi component phải có các trạng thái phù hợp: mặc định, đang nhấn, chọn, focus, loading, disabled, error. Disabled có lý do gần đó khi người dùng chưa hiểu điều kiện.

## 4. Mô hình thông tin: tách rõ tài sản, nội dung và lần đăng

Đây là quyết định UX quan trọng nhất của bản thiết kế.

| Đối tượng | Ý nghĩa | Ví dụ minh họa |
|---|---|---|
| Bất động sản | Hồ sơ thông tin và media của một tài sản | Căn hộ 2PN, 68 m² |
| Nội dung | Một phiên bản caption/ảnh/video được chuẩn bị cho tài sản | Bài giới thiệu căn hộ cho Facebook |
| Lần đăng | Một lần gửi một phiên bản nội dung đến một đích cụ thể | Đăng vào Page A lúc 09:00 |
| Hội thoại / khách | Trao đổi với người quan tâm | Khách hỏi lịch xem nhà |

Một bất động sản có nhiều nội dung; một nội dung có nhiều lần đăng. Sửa thông tin tài sản không được làm người dùng tưởng các bài đã đăng ngoài mạng xã hội tự động thay đổi.

### 4.1 Trạng thái riêng biệt

- **Tài sản:** Đang bán / Đang cho thuê / Tạm ngưng / Đã bán / Đã cho thuê / Lưu trữ.
- **Nội dung:** Nháp / Đang tạo / Cần duyệt / Sẵn sàng.
- **Lần đăng:** Chờ đăng / Đang gửi / Đã đăng / Đăng thất bại / Chờ xác nhận / Đã hủy lịch.
- **Kết nối:** Đã kết nối / Cần kết nối lại / Chưa kết nối.
- **Hội thoại:** Chưa đọc là trạng thái đọc; Chờ phản hồi là trạng thái công việc. Hai trạng thái này không đồng nghĩa.

Nếu dữ liệu hiện tại chưa hỗ trợ tách các đối tượng, agent lập bảng ánh xạ và kế hoạch chuyển đổi trước khi triển khai. Giao diện không tự suy diễn “đã bán” từ việc ngừng đăng hoặc “đã đăng” từ việc mở ứng dụng chia sẻ.

## 5. Kiến trúc điều hướng

Bốn tab chính: **Tổng quan · Bất động sản · Tin nhắn · Tài khoản**.

- CTA “Tạo tin” nằm rõ trên Tổng quan và Bất động sản. Không cần nút dấu cộng nổi giữa tab che nội dung.
- “Lịch đăng” và “Hiệu quả” truy cập từ Tổng quan; “Kênh đăng” truy cập từ Tổng quan và Tài khoản.
- Tab giữ vị trí cuộn và bộ lọc khi chuyển qua lại.
- Màn tạo tin, chỉnh sửa, chi tiết và chọn kênh dùng stack, ẩn tab để có footer ngữ cảnh.
- Trang con có nút quay lại, tiêu đề và tối đa một hành động phụ.
- Không buộc người dùng qua Dashboard mỗi lần trở về từ Facebook/Zalo.

Luồng chính:

**Tạo tin → Ảnh/video → Thông tin → Soạn & duyệt → Chọn kênh → Xác nhận → Kết quả theo kênh.**

Luồng từ tài sản có sẵn:

**Bất động sản → Chi tiết → Tạo nội dung mới → Duyệt → Đăng.**

Luồng sau đăng:

**Tổng quan → Lần đăng cần xử lý / Hội thoại chờ phản hồi → Xử lý → Cập nhật kết quả.**

## 6. Đặc tả màn hình

### 6.1 Splash, đăng nhập và thiết lập đầu tiên

**Splash:** logo nhỏ ở giữa trên nền sáng, không hoạt ảnh kéo dài. Khi có phiên hợp lệ, vào thẳng Tổng quan.

**Đăng nhập:** tên Nhà Nét, câu “Không gian làm việc của môi giới”, một khối form chính. Chỉ hiện phương thức xác thực có tích hợp thật. Nếu OTP: hỗ trợ dán mã, tự điền, gửi lại, mã sai/hết hạn; nếu mật khẩu: hiện/ẩn và quên mật khẩu.

**Thiết lập lần đầu:** hỏi tên hiển thị và vai trò nếu cần cho trải nghiệm. Kết nối kênh có thể làm sau. Không bắt người dùng nhập hồ sơ dài trước khi lưu tài sản đầu tiên.

**Quyền thiết bị:** chỉ xin quyền ảnh/camera khi chọn hành động liên quan; thông báo khi muốn nhận lịch đăng hoặc tin nhắn. Từ chối vẫn có đường dùng phù hợp.

**Trạng thái:** khôi phục phiên, lỗi mạng, xác thực thất bại, tài khoản chưa hoàn tất thiết lập. Không dùng tên người mẫu làm tên người dùng mặc định; dùng “Chào bạn”.

### 6.2 Tổng quan

Mục tiêu: trong vài giây người dùng biết việc cần làm tiếp theo.

**Bố cục từ trên xuống:**

1. Header: lời chào nhỏ, tên người dùng 26; avatar 48 bên phải mở Tài khoản.
2. Tiêu đề phụ theo ngày, ví dụ “Công việc hôm nay”; không hiển thị dự báo hiệu quả khi chưa có dữ liệu.
3. Khối chủ đạo xanh rừng: icon ảnh nhỏ, tiêu đề “Tin mới, sẵn sàng lên sóng”, mô tả một câu, CTA trắng “Tạo tin mới”. Cao tự nhiên khoảng 180–220, không ép nội dung.
4. Ba lối tắt gọn có icon và nhãn: Lịch đăng, Kênh đăng, Hiệu quả. Vùng chạm đủ lớn.
5. “Cần bạn xử lý”: tối đa ba hàng quan trọng, ưu tiên đăng lỗi → kênh hết kết nối → bản nháp cần duyệt. Mỗi hàng mở đúng đối tượng.
6. “Bất động sản gần đây”: tối đa ba card một cột và “Xem tất cả”.
7. “Lịch đăng tiếp theo” nếu có lịch khả dụng; nếu không có thì không dựng lịch trống chiếm diện tích.

**Chỉ số:** có thể đặt hàng ba chỉ số nhỏ dưới header: tài sản đang chào, bản nháp, bài chờ đăng. Số đếm phải là tổng đúng phạm vi, không lấy từ 10 bản ghi gần nhất rồi gọi là tổng.

**Tài khoản mới:** khối hướng dẫn ba bước gọn “Thêm ảnh → Điền thông tin → Duyệt và đăng”; CTA tạo đầu tiên. Không nhân đôi nhiều empty state trên cùng màn.

**Lỗi tải:** giữ dữ liệu đã có và banner “Chưa cập nhật được dữ liệu”; không đổi lỗi truy vấn thành số 0.

Wireframe tham chiếu:

    ┌──────────────────────────────────┐
    │ Chào buổi sáng             [AN] │
    │ An Nguyễn                       │
    │ Công việc hôm nay               │
    │ ┌──────────────────────────────┐│
    │ │ Tin mới, sẵn sàng lên sóng   ││
    │ │ Tạo nội dung từ ảnh căn nhà ││
    │ │ [＋ Tạo tin mới]             ││
    │ └──────────────────────────────┘│
    │ [Lịch đăng] [Kênh đăng] [Hiệu quả]│
    │ Cần bạn xử lý                   │
    │ [!] Một bài cần đăng lại      › │
    │ Bất động sản gần đây   Xem tất cả│
    │ [       Ảnh tài sản 4:3       ] │
    │ Căn hộ 2 phòng ngủ              │
    │ 2,8 tỷ · 68 m²                   │
    ├──────────────────────────────────┤
    │ Tổng quan  BĐS  Tin nhắn  Cá nhân│
    └──────────────────────────────────┘

Tên và số liệu trên wireframe là dữ liệu minh họa, không đưa vào tài khoản thật. Nhãn tab thực tế theo mục 5.

### 6.3 Danh sách bất động sản

- Header “Bất động sản”, phụ đề tổng tài sản; icon tạo mới 48 với nhãn trợ năng.
- Ô tìm kiếm cao 52: “Tìm tên, địa chỉ hoặc mã tài sản”.
- Chip trạng thái: Tất cả, Đang chào, Đã giao dịch, Lưu trữ; loại giao dịch Bán/Cho thuê nằm trong bộ lọc riêng.
- Dòng kết quả và nút lọc/sắp xếp, bộ lọc đang dùng có thể xóa.
- Danh sách mặc định một cột để ảnh và tiêu đề đủ lớn. Chế độ gọn có thể bổ sung khi số tài sản nhiều.
- Sắp xếp: Mới cập nhật, Mới tạo, Giá tăng, Giá giảm. Khi trộn bán và thuê, giá không so trực tiếp giữa hai đơn vị; yêu cầu chọn loại giao dịch trước hoặc tách nhóm.
- Tìm kiếm hỗ trợ không dấu theo khả năng dữ liệu; quay lại giữ từ khóa/vị trí.

**Card tài sản:**

- Ảnh 4:3, bo góc trên 16; nếu thiếu ảnh hiện khung nhà và “Chưa có ảnh”.
- Góc trái ảnh: badge Bán / Cho thuê. Góc phải: nút menu, không dùng icon trái tim vốn dành cho người mua.
- Phần chữ padding 16: tên hai dòng → địa chỉ có icon vị trí → giá đậm và diện tích.
- Footer phân cách nhẹ: trạng thái tài sản và tóm tắt xuất bản, ví dụ “2 bài đã đăng”; chỉ dùng khi có dữ liệu.
- Trạng thái “Có bài đăng lỗi” thể hiện ở footer, không đè toàn bộ ảnh màu đỏ.
- Menu: Xem chi tiết, Tạo nội dung, Đổi trạng thái, Lưu trữ. Xóa vĩnh viễn là hành động ít nổi bật và cần xác nhận hậu quả.

**Rỗng do lọc:** “Không có tài sản phù hợp” + “Xóa bộ lọc”.
**Rỗng lần đầu:** “Lưu bất động sản đầu tiên” + “Tạo tin mới”.
**Lỗi tải thêm:** giữ danh sách đã tải, nút “Thử lại” tại cuối.

### 6.4 Chi tiết bất động sản

- Gallery 4:3 ở đầu, số ảnh “1/8”, nút xem toàn bộ. Video có icon và thời lượng thật.
- Header nổi trên ảnh có nền đặc cho nút quay lại/menu; status bar tương phản phù hợp.
- Nội dung: loại giao dịch → tên đầy đủ → giá → địa chỉ → thông số chính.
- Các tab nội dung nhỏ: “Thông tin”, “Nội dung”, “Lịch sử đăng”. Có thể dùng phân đoạn để không nhồi tất cả vào một màn dài.
- Thông tin: diện tích, phòng ngủ, phòng tắm nếu có, pháp lý do người dùng cung cấp, hướng, tiện ích, ghi chú.
- Nội dung: các phiên bản caption/video, thời điểm sửa và trạng thái duyệt.
- Lịch sử đăng: từng lần đăng với kênh/tài khoản, giờ, trạng thái và đường dẫn khi có.
- Footer chính “Tạo nội dung”; “Sửa thông tin” ở header hoặc hành động phụ.
- Tài sản đã giao dịch: thông báo nhẹ; hỏi người dùng có muốn hủy lịch đăng còn chờ. Không tự tuyên bố đã gỡ bài ngoài mạng xã hội.

**Thông tin riêng tư:** ghi chú về chủ nhà, hoa hồng, giá thương lượng và số điện thoại nội bộ nằm trong khối “Chỉ mình bạn xem”. Nếu chưa có khả năng lưu riêng thì chưa hiện các trường này. Không đưa chúng vào prompt tạo caption hoặc bài đăng mặc định.

**Không tìm thấy/không còn quyền:** một trạng thái rõ kèm quay lại danh sách, không render hồ sơ trống như tài sản thật.

### 6.5 Bắt đầu tạo tin

CTA mở sheet với hai hành động:

- “Thêm bất động sản mới” — bắt đầu từ media.
- “Dùng bất động sản đã lưu” — mở danh sách chọn có tìm kiếm.

Nếu đang có bản nháp chưa hoàn tất, hiển thị “Tiếp tục bản nháp” kèm ảnh/tên/thời điểm trước các lựa chọn trên. Không âm thầm ghi đè bản nháp cũ.

### 6.6 Bước 1 — Ảnh và video

**Header:** quay lại, “Ảnh & video”, “Đóng”; dưới là tiến trình 1/3. Ba bước được tính đến hết duyệt nội dung; đăng bài là giai đoạn xác nhận tiếp theo.

**Trạng thái chưa có media:**

- Vùng chọn ảnh lớn 4:3 nền nhẹ, icon ảnh, “Chọn ảnh bất động sản”.
- CTA “Chọn từ thư viện”, nút phụ “Chụp ảnh” chỉ khi camera hoạt động thật.
- Mẹo ngắn: “Ưu tiên ảnh mặt tiền, phòng khách và không gian nổi bật”.

**Sau khi chọn:**

- Ảnh bìa lớn ở trên, nhãn “Ảnh bìa”; thumbnail bên dưới dạng lưới ba cột.
- Mỗi tile có menu “Đặt làm ảnh bìa”, “Di chuyển”, “Xóa”; không bắt buộc giữ lâu mới tìm được cách xóa.
- Có thể kéo sắp xếp; luôn có phương án di chuyển bằng nút cho khả năng tiếp cận.
- Video có thời lượng và trạng thái xử lý riêng; xóa video bằng nút rõ.
- Counter và giới hạn hiển thị từ cấu hình khả dụng. Không hardcode một giới hạn chung cho mọi mạng xã hội.
- Media đang tải có tiến trình thật khi có; không biết phần trăm thì dùng trạng thái vô định.
- Ảnh tải lỗi có “Thử lại” hoặc “Xóa ảnh”; các ảnh thành công được giữ.
- Footer “Tiếp tục” kèm số mục đã chọn. Nếu yêu cầu ít nhất một ảnh, nêu điều kiện gần footer.

**Chỉnh ảnh giai đoạn đầu:** crop, xoay, chọn bìa nếu được hỗ trợ. Không dùng chỉnh sửa làm sai hiện trạng, pháp lý hoặc đặc điểm bất động sản. Đánh dấu nội dung minh họa nếu có phối cảnh.

### 6.7 Bước 2 — Thông tin bất động sản

Mục tiêu: hoàn tất thông tin chính nhanh, không gặp một danh sách form kéo dài ngay từ đầu.

**Nhóm bắt buộc:**

1. Loại giao dịch Bán / Cho thuê, segmented control.
2. Loại tài sản, sheet chọn: căn hộ, nhà riêng, đất, văn phòng hoặc danh mục thực tế.
3. Giá: input số + đơn vị chọn rõ; có “Giá thỏa thuận” nếu nghiệp vụ cho phép.
4. Diện tích: input và đơn vị m² tách riêng.
5. Khu vực/địa chỉ: cho nhập thủ công. Có lựa chọn mức chi tiết địa chỉ đưa ra công khai.

**Nhóm bổ sung, thu gọn mặc định:**

- Tiêu đề gợi ý, phòng ngủ/phòng tắm nếu phù hợp loại tài sản.
- Hướng, pháp lý, tiện ích, mô tả nổi bật.
- Thông tin liên hệ được phép đưa vào bài đăng.
- Ghi chú riêng tách khỏi nội dung công khai.

**Quy tắc form:**

- Input cỡ 16, nhãn luôn thấy; placeholder là ví dụ, không thay nhãn.
- Bàn phím số phù hợp, nhận dấu phẩy thập phân và định dạng nhất quán.
- Giá/diện tích không nhận giá trị âm; không bật CTA chỉ vì trường chứa ký tự.
- Đổi Bán sang Cho thuê phải kiểm tra lại đơn vị và số tiền, không giữ số rồi âm thầm đổi ý nghĩa.
- Lỗi ngay dưới trường, giữ dữ liệu và đưa focus tới lỗi đầu khi tiếp tục.
- Gợi ý AI không được tự điền “sổ hồng”, “chính chủ”, “gần metro” nếu người dùng chưa cung cấp.
- Footer “Tiếp tục soạn nội dung”; có thể lưu bản nháp chưa đủ trường.

**Thoát:** đã lưu thành công thì về màn trước; chưa lưu được thì thông báo rõ và cho ở lại, thử lưu hoặc bỏ thay đổi.

### 6.8 Bước 3 — Studio nội dung AI

Màn hình phải tạo cảm giác người dùng đang biên tập tác phẩm của mình.

**Trước khi tạo:**

- Tóm tắt tài sản gọn với ảnh 56, tên, giá.
- Định dạng: Bài ảnh / Video, chỉ hiện lựa chọn hoạt động được.
- Giọng văn: Chuyên nghiệp / Gần gũi / Ngắn gọn. Mặc định Chuyên nghiệp.
- Điểm nhấn lấy từ thông tin đã nhập, có thể chọn/bỏ.
- CTA “Tạo bản nháp với AI”; có “Tự viết nội dung” để không chặn luồng khi AI lỗi.
- Nếu có chi phí hoặc hạn mức thực, thể hiện trước khi tạo. Không dựng số tín dụng giả.

**Đang tạo:**

- Tiến trình theo giai đoạn được xác nhận: chuẩn bị → tạo nội dung → hoàn tất.
- Không chạy phần trăm giả hoặc thời gian đếm ngược không có cơ sở.
- Cho quay lại an toàn theo khả năng tác vụ nền; nếu rời màn làm ngừng tác vụ thì nói rõ.
- Lỗi giữ thông tin và media, có “Thử lại” và “Tự viết”.

**Sau khi tạo:**

- Nhãn “Bản nháp AI — kiểm tra trước khi đăng”.
- Caption là vùng chỉnh sửa thực, cỡ 16, đủ cao để đọc.
- Toolbar gọn: Rút gọn, Đổi giọng văn, Tạo lại; mở sheet khi cần nhiều lựa chọn.
- Tạo lại giữ bản hiện tại cho đến khi có bản mới; cho khôi phục phiên bản trước.
- Hashtag là phần riêng có thể chỉnh, không chèn số lượng lớn không liên quan.
- Khối kiểm tra: giá, địa chỉ công khai, liên hệ, pháp lý, ảnh bìa. Nội dung thiếu được gắn nhãn.
- Nếu có thông tin mâu thuẫn giữa caption và hồ sơ, chỉ báo khi hệ thống thực sự phát hiện; không hiển thị dấu “Đã xác minh” mặc định.
- Footer “Chọn kênh đăng”; hành động phụ “Lưu bản nháp”.

**Video:** preview dọc 9:16 có play/pause, âm thanh, phụ đề và ảnh bìa nếu hỗ trợ. Những tùy chọn nhạc, giọng đọc, logo chỉ xuất hiện khi chức năng có thật. Có thông báo khi định dạng cần chuyển đổi.

### 6.9 Chọn kênh và tài khoản

Không được coi “đã kết nối” đồng nghĩa với “có thể tự động đăng mọi loại nội dung”.

Mỗi hàng kênh hiển thị:

- Logo nhỏ, tên nền tảng, tên tài khoản/Page/OA cụ thể.
- Trạng thái kết nối.
- Phương thức thực tế: “Đăng trực tiếp”, “Mở ứng dụng để chia sẻ”, hoặc “Sao chép nội dung”.
- Định dạng hỗ trợ cho lựa chọn hiện tại và lý do không khả dụng nếu có.
- Checkbox chỉ cho chọn đích khả dụng; nhiều tài khoản cùng nền tảng hiển thị riêng.

**Ví dụ minh họa bố cục, không phải cam kết API:**

| Đích | Phương thức hiển thị | Hành động |
|---|---|---|
| Page của môi giới | Đăng trực tiếp, nếu được cấp quyền | Chọn đăng |
| Tài khoản cần chia sẻ thủ công | Mở ứng dụng | Tiếp tục chia sẻ |
| Kênh hết phiên | Cần kết nối lại | Kết nối lại |
| Nền tảng chưa tích hợp | Không hiển thị như đích đăng sẵn sàng | Chỉ nằm trong roadmap |

Có thể thêm kênh từ màn này rồi trở lại, giữ bản nháp và lựa chọn trước. Không tự chọn toàn bộ tài khoản mới kết nối.

### 6.10 Xem trước và xác nhận đăng

- Header “Kiểm tra trước khi đăng”.
- Các tab theo đích đã chọn, mỗi tab có tên tài khoản để tránh đăng nhầm.
- Preview gồm ảnh/video, caption và liên hệ đúng phiên bản sẽ gửi.
- Preview chỉ mô phỏng nội dung; không hứa giống tuyệt đối giao diện mạng xã hội.
- Nếu cần crop, giới hạn chữ hoặc thay định dạng: chỉ ra nội dung bị ảnh hưởng và cho chỉnh trước.
- Chọn “Đăng ngay” hoặc “Lên lịch” cho đích thật sự hỗ trợ.
- Mặc định an toàn: mở màn chưa gửi bài; chỉ hành động CTA cuối mới bắt đầu xuất bản.
- CTA có nghĩa cụ thể: “Đăng lên 2 kênh”, “Lưu lịch đăng” hoặc “Mở Zalo để chia sẻ”.
- Nếu trộn đăng trực tiếp và chia sẻ thủ công, tách hai nhóm có trình tự, giải thích bước tiếp theo.

### 6.11 Lịch đăng

- Header “Lịch đăng”, toggle ngày/tuần nếu cần; mặc định danh sách theo ngày để dễ đọc trên điện thoại.
- Thanh tuần ngang chọn ngày; bên dưới là các lịch với giờ, ảnh, tài khoản và trạng thái.
- Sheet đặt lịch: ngày, giờ, múi giờ hiển thị rõ “Giờ Việt Nam · UTC+7”.
- Không cho giờ quá khứ; thông báo xung đột chỉ nếu có quy tắc hệ thống.
- Phân biệt **tự động đăng** và **nhắc bạn đăng thủ công**. Lịch nhắc không được mang nhãn “Tự động đăng”.
- Sửa/hủy lịch chỉ hoàn thành khi có xác nhận lưu; nếu đang gửi thì giải thích khả năng thay đổi.
- Kênh mất kết nối trước giờ đăng có trạng thái cần xử lý và lối kết nối lại.
- Empty state: “Chưa có lịch đăng” + “Chọn nội dung để lên lịch”.

### 6.12 Tiến trình và kết quả xuất bản

Màn hình gồm tiêu đề kết quả tổng và danh sách kết quả theo đích.

| Tình huống | Cách thể hiện |
|---|---|
| Tất cả thành công | “Đã đăng lên 2 kênh”, đường dẫn từng bài nếu có |
| Thành công một phần | “1 kênh đã đăng, 1 kênh cần xử lý” |
| Đang xử lý | Spinner theo từng kênh, giữ các kết quả đã xong |
| Không xác định kết quả | “Đang kiểm tra kết quả”; kiểm tra lại trước khi gửi lại |
| Chia sẻ thủ công | “Đã mở ứng dụng”; yêu cầu người dùng xác nhận đã hoàn tất nếu không có tín hiệu đáng tin |
| Thất bại đã xác định | Lý do dễ hiểu và “Thử lại kênh này” |

- Không tự đăng lại toàn bộ khi chỉ một kênh lỗi.
- Trạng thái chờ xác nhận không được tính vào số bài đã đăng.
- Mỗi lần đăng lưu phiên bản nội dung dùng lúc gửi để lịch sử không thay đổi theo chỉnh sửa mới.
- Có thể rời màn và xem kết quả tại Lịch sử đăng nếu tác vụ nền được hỗ trợ.
- CTA cuối “Về bất động sản” và liên kết “Xem bài đăng” khi có URL thật.
- Nếu nhà cung cấp đã nhận bài nhưng app mất mạng, không vội báo thất bại.

### 6.13 Tin nhắn

**Phạm vi:** chỉ gom hội thoại từ những kênh thực sự hỗ trợ. Nếu chỉ Facebook Messenger được tích hợp, tên nguồn thể hiện chính xác, không giả một inbox đa nền tảng.

- Header “Tin nhắn”, số chưa đọc thật nếu có.
- Bộ lọc: Tất cả / Chưa đọc / Chờ phản hồi; bộ lọc kênh riêng khi có nhiều nguồn.
- Search theo tên hoặc nội dung được lưu và được phép tìm.
- Mỗi dòng: avatar 48, tên đậm nếu chưa đọc, thời gian, tin gần nhất, nguồn kênh nhỏ.
- Nhãn bất động sản liên quan chỉ khi có liên kết chắc chắn hoặc người dùng gắn; không đoán từ mọi nội dung tin.
- “Chờ phản hồi” dựa trên người gửi tin gần nhất và quy tắc nghiệp vụ, không đồng nhất với unread.
- Nếu chưa kết nối: CTA “Kết nối kênh hỗ trợ tin nhắn”.
- Nếu không tải được: giữ hội thoại đã có; báo lỗi đồng bộ.

### 6.14 Hội thoại và thông tin khách

- Header: quay lại, tên khách, tên kênh/tài khoản.
- Bubble nhận nền trung tính, gửi nền xanh nhẹ; chữ tương phản, không dùng nền quá chói.
- Phân nhóm thời gian; trạng thái “Đang gửi”, “Đã gửi”, “Gửi lỗi” riêng từng tin. “Đã đọc” chỉ khi nguồn cung cấp.
- Composer luôn trên bàn phím, input nhiều dòng giới hạn chiều cao rồi cuộn, nút gửi có nhãn rõ.
- Gửi lỗi giữ nội dung, cho thử lại; không tự lặp tin khi chưa rõ đã gửi.
- Nếu kênh không cho gửi ở thời điểm hiện tại, giải thích ngắn và đưa lối mở kênh gốc khi có.
- Câu trả lời nhanh: giá, địa chỉ công khai, lịch xem nhà. Khi chọn phải được xem trước và sửa.
- AI soạn trả lời chỉ là bản nháp cho người dùng duyệt, không bật tự trả lời mặc định.
- Sheet khách hàng giai đoạn P1: tên, số điện thoại đã được cung cấp, tài sản quan tâm, ghi chú, bước chăm sóc.
- Trạng thái khách đơn giản: Mới → Đang trao đổi → Hẹn xem → Đã chốt / Không tiếp tục. Không bắt điền CRM trước khi trả lời.

### 6.15 Hiệu quả

Mục tiêu: giúp hiểu nội dung nào có tác dụng, với dữ liệu có thể giải thích được.

- Header “Hiệu quả”, nút cập nhật có thời điểm đồng bộ gần nhất.
- Chọn khoảng thời gian: 7 ngày / 30 ngày / Tùy chọn nếu hỗ trợ.
- Bộ lọc tài khoản và nền tảng.
- Ba chỉ số đầu: lượt xem, tương tác, hội thoại mới nếu nguồn đủ dữ liệu.
- Mỗi chỉ số có định nghĩa, phạm vi và dấu “—” khi không được cung cấp; 0 chỉ khi đã biết là không phát sinh.
- Biểu đồ đơn giản theo thời gian, có nhãn trục/thang đo và cách đọc giá trị không phụ thuộc màu.
- Bảng bài đăng nổi bật có ảnh, tên, kênh, chỉ số so sánh cùng định nghĩa.
- Không cộng “reach” nhiều nền tảng rồi gọi là số người duy nhất.
- So sánh tăng/giảm chỉ khi hai khoảng thời gian tương đương và dữ liệu đủ.
- Không đưa “giờ vàng”, dự đoán khách hoặc mức tăng chuyển đổi nếu chưa có phương pháp và dữ liệu.
- Với dữ liệu lưu dạng snapshot, trình bày xu hướng snapshot đúng nghĩa; không biến thành lượt phát sinh theo ngày.
- Trạng thái thiếu quyền có hướng cập nhật kết nối, không biểu đồ giả cho đẹp.

### 6.16 Kênh đăng

- Header “Kênh đăng”, giải thích ngắn “Quản lý nơi bạn xuất bản nội dung”.
- Card nền tảng có danh sách tài khoản/Page/OA bên trong.
- Mỗi tài khoản: tên, loại đích, trạng thái, khả năng hiện có: đăng ảnh, video, lên lịch, nhận/gửi tin.
- Chỉ hiện khả năng đã được xác nhận; các capability là dữ liệu động khi triển khai.
- Kết nối có các trạng thái đang mở xác thực, đang kiểm tra, chọn tài khoản và thành công.
- Hủy xác thực trở lại bình thường, không coi là lỗi nghiêm trọng.
- Ngắt kết nối nêu tác động lên lịch đang chờ và inbox; không xóa lịch sử bài đăng nếu không có yêu cầu.
- Không hiển thị token, scope nội bộ hoặc tên API trong luồng thường dùng.

### 6.17 Tài khoản, thương hiệu và cài đặt

- Header “Tài khoản”, avatar, tên và thông tin thật từ hồ sơ.
- Menu nhóm “Công việc”: Kênh đăng, Thương hiệu nội dung nếu có.
- Menu nhóm “Tùy chọn”: Thông báo, Quyền riêng tư, Trợ giúp, Đăng xuất.
- Không có thống kê mẫu, toggle giả hoặc nút logo không làm gì.
- Bộ thương hiệu P1: logo, tên hiển thị, liên hệ công khai, màu nội dung; có preview và nút lưu.
- Thay template thương hiệu áp dụng cho nội dung mới; việc sửa video đã xuất phải được thao tác riêng.
- Thông báo chia loại: kết quả đăng, lịch cần xử lý, tin nhắn. Người dùng điều khiển từng loại được hỗ trợ.
- Đăng xuất cảnh báo bản nháp chưa đồng bộ khi có; không âm thầm xóa.
- Gói trả phí/chỉ tiêu sử dụng chỉ hiện nếu nghiệp vụ thật sự có và thông tin rõ.

## 7. Lưu bản nháp, mất mạng và phục hồi

Đây là yêu cầu trải nghiệm xuyên suốt, không phải một màn riêng.

1. Nhập form lưu cục bộ theo khả năng; hiển thị “Đã lưu trên thiết bị” khác “Đã đồng bộ”.
2. Khi mạng trở lại, đồng bộ có trạng thái; lỗi không ghi đè bản tốt bằng bản rỗng.
3. Thoát bước/quay lại giữ media, caption và lựa chọn.
4. Nếu bản nháp trên thiết bị và máy chủ khác nhau, cho xem thời gian và lựa chọn phiên bản; không tự ghi đè khi có nguy cơ mất chỉnh sửa.
5. Khi app bị đóng trong lúc đăng, lần mở sau kiểm tra kết quả trước khi cho gửi lại.
6. Người dùng được biết khi media chỉ còn trên thiết bị và chưa tải lên.
7. Không hứa hoạt động ngoại tuyến cho AI, kết nối kênh hoặc đăng trực tiếp.

## 8. Chuyển động, phản hồi và khả năng tiếp cận

- Nhấn: 100–150ms; chuyển trang: khoảng 200–280ms; sheet: khoảng 250–320ms. Đây là mốc thiết kế, ưu tiên hành vi native phù hợp.
- Không làm card phóng to/nảy mạnh khi đăng bài. Haptic nhẹ cho hoàn tất hoặc chọn quan trọng nếu có.
- Tôn trọng giảm chuyển động; bỏ shimmer và dịch chuyển trang trí.
- Snackbar không che footer. Lỗi cần xử lý phải tồn tại tại vị trí liên quan, không chỉ lóe lên rồi mất.
- Bottom sheet có nút đóng và hành vi back rõ; không dựa hoàn toàn vào vuốt.
- Hỗ trợ font scaling; ở chữ lớn chuyển hai cột thành một, footer xếp dọc.
- Kiểm tra rộng 320, 360, 390, 430; safe area và bàn phím không che CTA/trường nhập.
- Mục tiêu tương phản: chữ thông thường 4,5:1, chữ lớn 3:1, điều khiển cần nhận biết 3:1. Phải đo các cặp thực tế, không coi bảng màu là chứng nhận đạt chuẩn.
- Icon tương tác có nhãn; trạng thái chọn/loading/lỗi được thông báo cho trình đọc màn hình.
- Thứ tự focus theo nội dung; đóng modal trả focus về nút gọi.
- Không dùng màu làm dấu hiệu duy nhất cho trạng thái đăng.
- Preview video có phụ đề khi khả dụng, không tự phát âm thanh.

Các mốc tương phản tham chiếu [WCAG 2.2](https://www.w3.org/TR/WCAG22/); mốc vùng chạm 48dp tham chiếu [Android Accessibility](https://support.google.com/accessibility/android/answer/7101858?hl=en). Cần kiểm thử phù hợp với app native.

## 9. Giọng văn và nội dung giao diện

Dùng “bất động sản” cho hồ sơ tài sản, “nội dung” cho bản biên tập, “bài đăng” cho nội dung đã được đưa lên một kênh. Tránh dùng “tin đăng” cho cả ba đối tượng trong một màn.

| Tình huống | Nội dung mẫu |
|---|---|
| Lưu cục bộ | “Đã lưu bản nháp trên thiết bị” |
| Lưu máy chủ | “Đã đồng bộ bản nháp” |
| AI hoàn tất | “Bản nháp đã sẵn sàng. Kiểm tra thông tin trước khi đăng.” |
| Thiếu thông tin | “Nhập diện tích để tiếp tục” |
| Kênh hết kết nối | “Kết nối lại tài khoản này để tiếp tục đăng” |
| Thành công một phần | “Facebook đã đăng. Kênh còn lại cần xử lý.” |
| Kết quả chưa rõ | “Đang kiểm tra kết quả. Chưa cần gửi lại.” |
| Chia sẻ thủ công | “Hoàn tất thao tác trong ứng dụng, rồi quay lại Nhà Nét.” |
| Không có báo cáo | “Chưa có dữ liệu cho khoảng thời gian này” |
| Tài sản đã giao dịch | “Đã cập nhật trạng thái tài sản. Các bài trên mạng xã hội chưa được gỡ.” |

Tên nền tảng, số lượng và nội dung mẫu phải thay theo dữ liệu thực. Không dùng câu “AI lo tất cả” hoặc “Đăng mọi nền tảng trong một chạm” nếu người dùng vẫn cần duyệt/chia sẻ thủ công.

## 10. Tính năng đề xuất theo ưu tiên

Danh sách này là backlog cần đối chiếu, không khẳng định tất cả đều đang thiếu.

| Ưu tiên | Tính năng | Giá trị | Phụ thuộc |
|---|---|---|---|
| P0 | Hệ thống giao diện thống nhất | Thẩm mỹ và thao tác nhất quán | Bộ token/component |
| P0 | Hồ sơ tài sản, tìm kiếm và lọc | Tìm và tái sử dụng thông tin | Mô hình dữ liệu rõ |
| P0 | Media có ảnh bìa, sắp xếp, xóa | Kiểm soát chất lượng nội dung | Upload và lưu thứ tự |
| P0 | Bản nháp và phục hồi | Tránh mất công nhập | Lưu cục bộ/đồng bộ |
| P0 | AI có chỉnh sửa và tự viết | Hoàn tất được khi AI lỗi | Tạo nội dung và editor |
| P0 | Chọn đúng đích/phương thức đăng | Tránh đăng nhầm | Capability và kết nối thật |
| P0 | Preview và xác nhận cuối | Kiểm soát nội dung công khai | Phiên bản theo kênh |
| P0 | Kết quả riêng từng kênh | Xử lý thất bại một phần | Trạng thái xác minh |
| P0 | Inbox hiện có, trạng thái gửi rõ | Phản hồi khách tin cậy | Kênh được hỗ trợ |
| P0 | Loading/error/empty, safe area | Luồng dùng hoàn chỉnh | Thiết kế và kiểm thử |
| P1 | Lịch đăng / lịch nhắc tách biệt | Chủ động công việc | Tác vụ nền hoặc nhắc lịch |
| P1 | Hiệu quả có nguồn và thời gian | Đánh giá nội dung | API và quyền dữ liệu |
| P1 | Câu trả lời nhanh, gắn tài sản | Giảm nhập lặp | Dữ liệu hội thoại |
| P1 | Bộ thương hiệu nội dung | Nhận diện cá nhân | Template/render thật |
| P1 | CRM nhẹ, lịch xem nhà | Theo dõi nhu cầu | Quy trình chăm sóc |
| P1 | Phiên bản nội dung | Khôi phục và tái sử dụng | Lưu lịch sử |
| P2 | Cộng tác nhóm và duyệt bài | Phục vụ sàn nhỏ | Phân quyền/ownership |
| P2 | Nội dung theo chiến dịch | Quản lý nhiều bài | Nhu cầu đã kiểm chứng |
| P2 | Gợi ý lịch đăng có cơ sở | Hỗ trợ quyết định | Đủ dữ liệu và phương pháp |
| P2 | Chế độ tối | Tùy chọn hiển thị | Bộ màu/QA riêng |

Không ưu tiên thêm marketplace người mua, giỏ hàng, thanh toán mua nhà, mạng xã hội nội bộ hoặc trò chơi tích điểm vào redesign này.

## 11. Ma trận dữ liệu và giới hạn nền tảng

Agent triển khai cần lập bảng này từ khả năng thật trước khi hoàn thiện tương tác:

| Chức năng | Cần xác nhận | Fallback UX |
|---|---|---|
| Đăng trực tiếp | Loại tài khoản, quyền, định dạng | Chia sẻ thủ công nếu khả dụng |
| Lên lịch tự động | Backend giữ lịch và thực thi | Lịch nhắc có nhãn rõ |
| Video | Giới hạn, upload, xử lý | Bài ảnh hoặc tải media nếu hỗ trợ |
| Inbox | Đọc/gửi và phạm vi hội thoại | Mở nền tảng gốc |
| Số liệu | Định nghĩa, cửa sổ thời gian, độ trễ | “Chưa có dữ liệu” |
| Gỡ/sửa bài đã đăng | Quyền và khả năng cập nhật | Hướng dẫn mở bài gốc |
| Xác nhận chia sẻ | Tín hiệu hệ thống có đáng tin | “Chờ bạn xác nhận” |
| Hồ sơ tài sản | Đơn vị giá, trạng thái, quyền xem | Không tự suy diễn dữ liệu |

Tài liệu không khẳng định khả năng API hiện hành của Facebook, Zalo, TikTok hoặc nền tảng khác. Khi triển khai tích hợp, phải tra tài liệu chính thức hiện hành và quyền thực tế của ứng dụng. Không thiết kế trạng thái thành công vượt quá điều hệ thống xác nhận được.

## 12. Kế hoạch bàn giao cho agent

### Giai đoạn A — Đối chiếu nghiệp vụ

- Kiểm kê màn hình/chức năng hiện có, dữ liệu thật và tính năng chưa hoàn thiện.
- Ánh xạ tài sản, nội dung và lần đăng; xác nhận các đơn vị giá và trạng thái.
- Lập ma trận capability từng đích đăng.
- Giữ phần nghiệp vụ đang hoạt động; quyền xây lại UI không đồng nghĩa xóa dữ liệu hoặc bỏ tích hợp.

### Giai đoạn B — Chốt thiết kế chủ đạo

Dựng mockup chi tiết cho Tổng quan, danh sách Bất động sản, Studio AI và Kết quả đăng. Bốn màn phải cho thấy cùng một ngôn ngữ thiết kế trong cả trạng thái nhiều dữ liệu lẫn tài khoản mới.

Bàn giao token, component, quy tắc ảnh, kiểu chữ, trạng thái nút/input và footer.

### Giai đoạn C — Hoàn thiện luồng tạo và đăng

Dựng đầy đủ: chọn ảnh → thông tin → AI/tự viết → chọn đích → preview → gửi → kết quả. Có prototype cho mất mạng, kênh hết phiên, AI lỗi, thành công một phần và chia sẻ thủ công.

### Giai đoạn D — Hoàn thiện công việc sau đăng

Chi tiết tài sản, lịch sử đăng, lịch đăng, inbox/hội thoại, hiệu quả, kênh đăng và tài khoản. Chức năng P1 chưa có backend phải được đánh dấu là phụ thuộc, không dựng nút giả.

### Giai đoạn E — Kiểm thử trước hiện thực hóa và phát hành

Kiểm thử tác vụ với người dùng mục tiêu, điều chỉnh thiết kế, sau đó triển khai kỹ thuật khi có yêu cầu riêng. Với workspace này, **đọc đúng tài liệu Expo SDK v57 tại https://docs.expo.dev/versions/v57.0.0/ trước khi viết code**, theo AGENTS.md.

**Bộ bàn giao cần có:**

- Bản thiết kế tất cả màn P0 và trạng thái liên quan.
- Prototype hành trình chính và các nhánh lỗi quan trọng.
- Component/tokens và quy tắc responsive.
- Microcopy tiếng Việt.
- Danh sách dữ liệu, quyền, dịch vụ phụ thuộc.
- Checklist nghiệm thu và những chức năng chưa được hỗ trợ.

## 13. Tiêu chí nghiệm thu

### 13.1 Chất lượng hình thức

- Toàn app dùng chung màu, chữ, bo góc, icon, khoảng cách.
- Thay đổi có thể thấy rõ ở bố cục và phân cấp, không chỉ đổi màu.
- Ảnh không méo, tiêu đề tiếng Việt không bị cắt vô lý.
- CTA chính dễ nhận biết, đủ vùng chạm.
- Màn rỗng vẫn có bố cục được thiết kế, không chỉ một dòng chữ giữa màn.
- Không có số liệu, tên người dùng, kênh, thumbnail giả trong tài khoản thật.
- Font lớn và màn hẹp không làm mất giá, trạng thái hoặc nút tiếp tục.

### 13.2 Chất lượng hành trình

- Tạo được tài sản, lưu nháp, đóng app và tiếp tục theo khả năng lưu đã cam kết.
- Biết ảnh bìa nào sẽ dùng và thay đổi được.
- Phân biệt thông tin công khai với ghi chú riêng.
- Sửa caption trước khi đăng; AI lỗi vẫn có thể tự viết.
- Nhìn thấy chính xác tài khoản nhận bài trước CTA cuối.
- Không có bài được gửi chỉ do mở preview/chọn kênh.
- Thành công một phần có thể xử lý từng kênh, tránh đăng lặp.
- Chia sẻ thủ công không bị báo thành công tự động.
- Lịch nhắc và lịch tự động không bị nhầm lẫn.
- Kết quả chưa rõ được xác minh trước khi gửi lại.
- Inbox và báo cáo không ngụ ý hỗ trợ nguồn chưa tích hợp.
- Mất mạng không xóa dữ liệu nhập có thể giữ được.
- Back/đóng modal/quay về từ ứng dụng ngoài đưa người dùng về đúng bước.

### 13.3 Thử nghiệm định tính

Mời 5–8 môi giới phù hợp cho vòng đầu; số lượng này dùng tìm vấn đề, không chứng minh mức tăng trưởng.

Nhiệm vụ:

1. Thêm một căn hộ, chọn bìa và nhập giá đúng đơn vị.
2. Lưu nháp rồi quay lại tiếp tục.
3. Tạo caption, sửa một thông tin AI chưa đúng.
4. Chọn đúng tài khoản và xem trước nội dung công khai.
5. Xử lý tình huống một kênh thành công, một kênh lỗi.
6. Phân biệt bài đã đăng với thao tác chia sẻ chưa xác nhận.
7. Tìm một khách đang chờ trả lời và tài sản liên quan.

Ghi nhận chỗ do dự, thao tác sai và dữ liệu hiểu nhầm. Nhầm tài khoản đăng, giá, địa chỉ công khai hoặc trạng thái xuất bản là lỗi cần sửa trước phát hành.

### 13.4 Đo lường sau triển khai

Theo dõi tỷ lệ hoàn tất tạo nội dung, bản nháp được tiếp tục, thời gian đến bản duyệt, tỷ lệ xuất bản theo phương thức, lỗi theo kênh và thời gian phản hồi khách trong phạm vi dữ liệu có.

Lấy đường cơ sở rồi mới đặt mục tiêu cải thiện. Không hứa tăng chuyển đổi khi chưa đo. Phân biệt hoàn tất chia sẻ do người dùng xác nhận với bài được nền tảng xác nhận. Không đưa thông tin riêng của chủ nhà/khách hoặc token vào sự kiện phân tích.

## 14. Brief có thể giao trực tiếp cho agent

> Thiết kế lại toàn bộ UI Nhà Nét theo tài liệu này, cho công cụ môi giới tạo và đăng nội dung bất động sản lên mạng xã hội. Dùng nền sáng ấm, xanh rừng, Be Vietnam Pro, ảnh tài sản lớn và bốn tab Tổng quan/Bất động sản/Tin nhắn/Tài khoản. Tách rõ hồ sơ tài sản, nội dung biên tập và lần đăng theo kênh. Hoàn thiện luồng media → thông tin → AI hoặc tự viết → chọn đích → preview → xác nhận → kết quả theo kênh. Lưu nháp, xử lý lỗi, safe area và trạng thái chia sẻ thủ công là yêu cầu cốt lõi. Đối chiếu khả năng thật của nền tảng trước khi hiển thị đăng trực tiếp, lên lịch, inbox hoặc số liệu. Không dùng dữ liệu giả hoặc tương tác giả trong production. Quyền làm lại UI không bao gồm xóa dữ liệu người dùng. Ưu tiên P0, sau đó P1 theo phụ thuộc. Khi được giao code, đọc Expo v57 theo AGENTS.md và kiểm thử toàn bộ luồng trước bàn giao.

## 15. Nguồn tham chiếu và phạm vi

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): tham chiếu khả năng tiếp cận và tương phản.
- [Android Accessibility — Touch target size](https://support.google.com/accessibility/android/answer/7101858?hl=en): tham chiếu vùng chạm.
- [Expo SDK v57](https://docs.expo.dev/versions/v57.0.0/): tài liệu bắt buộc đọc trước công việc code tại workspace này.

Bố cục, màu sắc, roadmap và luồng trong tài liệu là đề xuất thiết kế cho Nhà Nét, không phải yêu cầu bắt buộc từ các nguồn trên. Tài liệu này thay thế kế hoạch bán lẻ trước đây; chưa triển khai bất kỳ thay đổi giao diện hoặc tích hợp nào trong lần lập kế hoạch này.
