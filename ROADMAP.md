# THC eFootball Shop — Roadmap Nâng Cấp

> Phân tích ngày: 2026-03-27
> Mục tiêu: Scale lên sàn lớn, tăng số CTV, giải quyết thiếu hụt nguồn acc
> Trạng thái: Đang triển khai

---

## Tổng quan

**Pain point chính:** Số lượng acc quá ít so với nhu cầu khách hàng
**Nguyên nhân gốc:** Thiếu CTV + CTV hiện tại gặp khó khăn trong thu mua & định giá acc
**Chiến lược:** Tập trung supply-side — tăng số CTV & giúp CTV hoạt động hiệu quả hơn

**Hiện trạng:** 10 CTV active, 174+ giao dịch, traffic chủ yếu từ Facebook groups

---

## PHASE 1: Giải quyết pain point cốt lõi (CTV pricing + sourcing)

### ~~1.1. Công cụ định giá tự động (Auto-Pricing Tool)~~
- **Trạng thái:** Đã huỷ
- **Lý do:** Định giá acc eFootball phụ thuộc vào nhận diện cầu thủ, loại thẻ (BigTime/Epic/Showtime), tier cầu thủ theo meta — không thể tự động hoá bằng stats đơn giản. Cần con người phân tích.

### 1.2. Đơn giản hóa flow đăng acc cho CTV
- **Impact:** Cao | **Effort:** Thấp–Trung bình
- **Trạng thái:** [x] Hoàn thành (2026-03-27)
- **Mô tả:** Giảm friction khi CTV đăng acc mới
- **Chi tiết:**
  - Quick Post mode: ẩn sections Chỉ số và Liên kết, chỉ cần Ảnh + Tiêu đề + Giá + Cài đặt
  - Nút "Tạo acc tương tự" trong dropdown actions → pre-fill form từ acc hiện có (không copy ảnh/email)
- **Deliverables:**
  - [x] Quick Post mode toggle (Nhanh/Đầy đủ) trong AccountForm
  - [x] "Tạo acc tương tự" action trong AccountActionsDropdown
  - [x] New account page hỗ trợ `?from=ID` query param

### 1.3. Dashboard CTV cải thiện
- **Impact:** Trung bình–Cao | **Effort:** Trung bình
- **Trạng thái:** [x] Hoàn thành (2026-03-27)
- **Mô tả:** Thêm thông tin hữu ích giúp CTV ra quyết định
- **Deliverables:**
  - [x] Bảng xếp hạng CTV: `CTVLeaderboard` component — top 5 seller tháng
  - [x] "Khách Đang Tìm": widget `HotRequests` hiện top 5 yêu cầu chưa xử lý
  - [x] Quick stats trên sidebar: `SidebarStats` — acc đang bán + bán tuần này

---

## PHASE 2: Thu hút thêm CTV mới

### 2.1. Landing page tuyển CTV chuyên nghiệp hơn
- **Impact:** Trung bình–Cao | **Effort:** Trung bình
- **Trạng thái:** [x] Hoàn thành (2026-03-27)
- **Mô tả:** Nâng cấp `/seller/apply` để thuyết phục CTV tiềm năng
- **Deliverables:**
  - [x] Hiển thị thu nhập mẫu (3 tiers: mới/trung bình/top)
  - [ ] Testimonials CTV hiện tại (cần collect từ CTV thực)
  - [x] Bảng so sánh "Bán trên THC vs Tự bán" (7 tiêu chí)
  - [x] FAQ cho CTV (5 câu hỏi phổ biến)
  - [ ] Video hướng dẫn walkthrough (cần record)
  - [x] Contact CTA section với link Zalo group + direct

### 2.2. Referral Program (CTV giới thiệu CTV)
- **Impact:** Trung bình–Cao | **Effort:** Thấp
- **Trạng thái:** [x] Hoàn thành (2026-03-27)
- **Mô tả:** Tracking giới thiệu CTV mới
- **Deliverables:**
  - [x] Thêm field `referred_by` vào seller_applications (migration)
  - [x] Link referral unique: `thc-efb.com/seller/apply?ref=CTV_ID`
  - [x] Form tự động lưu `referred_by` từ query param
  - [ ] Super admin UI hiện ai giới thiệu ai (cần thêm vào applications page)

### 2.3. Tự động hóa onboarding CTV
- **Impact:** Trung bình | **Effort:** Trung bình
- **Trạng thái:** [ ] Chưa bắt đầu
- **Mô tả:** Giúp CTV mới bắt đầu nhanh hơn
- **Deliverables:**
  - [ ] Email welcome tự động khi approve (dùng Nodemailer sẵn có)
  - [ ] Checklist onboarding trên dashboard CTV mới
  - [ ] Guide page interactive thay vì wall-of-text

---

## PHASE 3: Tăng traffic & conversion cho storefront

### 3.1. Tối ưu cho traffic từ Facebook
- **Impact:** Trung bình | **Effort:** Thấp–Trung bình
- **Trạng thái:** [x] Đã có sẵn
- **Mô tả:** OG tags + ShareButtons đã được implement trước đó
- **Deliverables:**
  - [x] OG image cho mỗi acc (dùng primary_image_url qua ImageKit)
  - [x] `ShareButtons` component trên trang detail
  - [x] OG + Twitter Card meta tags đầy đủ

### 3.2. Cải thiện trang chi tiết acc
- **Impact:** Trung bình | **Effort:** Trung bình
- **Trạng thái:** [x] Hoàn thành (2026-03-27)
- **Mô tả:** Thêm thông tin, giảm số lần khách phải hỏi qua Zalo
- **Deliverables:**
  - [x] Field `description` — textarea trong AccountForm + hiển thị trên detail page
  - [x] Migration thêm column + update views
  - [ ] Tags system: "Kẹp Messi", "Pack Arsenal" (defer — cần thêm bảng tags)
  - [ ] Gallery: swipe trên mobile, zoom on tap (đã có ImageGallery)
  - [ ] CTA sticky trên mobile

### 3.3. SEO mở rộng
- **Impact:** Trung bình | **Effort:** Trung bình
- **Trạng thái:** Một phần (2026-03-27)
- **Deliverables:**
  - [ ] Trang danh mục tĩnh: `/acc-clone`, `/acc-server-japan`,...
  - [x] Sitemap.xml động — đã có, thêm /faq + /seller/apply
  - [ ] 3-5 bài blog SEO (cần viết content)

---

## PHASE 4: Nâng cao (sau khi có traction)

### 4.1. PWA (Progressive Web App)
- **Trạng thái:** [ ] Chưa bắt đầu
- Add to Home Screen, offline browsing catalog

### 4.2. Wishlist
- **Trạng thái:** [ ] Chưa bắt đầu
- Khách đánh dấu acc quan tâm (localStorage)

### 4.3. So sánh acc
- **Trạng thái:** [ ] Chưa bắt đầu
- Chọn 2-3 acc so sánh side-by-side

### 4.4. Web Push Notification
- **Trạng thái:** [ ] Chưa bắt đầu
- Thông báo acc mới cho khách đã subscribe

### 4.5. CTV mobile-friendly (PWA)
- **Trạng thái:** [x] Hoàn thành (2026-03-27)
- **Deliverables:**
  - [x] Web App Manifest (`src/app/manifest.ts`) — installable trên mobile
  - [x] Service Worker (`public/sw.js`) — network-first cache, offline fallback
  - [x] PWA icons (192x192, 512x512) + Apple Touch Icon
  - [x] Apple mobile web app meta tags (standalone, status bar style)
  - [x] Theme color (light/dark)
  - [ ] Thay icons bằng logo chính thức (hiện dùng crop từ thc-shop.jpg)

---

## Bảng tổng hợp ưu tiên

| # | Feature | Impact | Effort | Phase | Trạng thái |
|---|---------|--------|--------|-------|------------|
| 1 | ~~Auto-pricing tool~~ | — | — | 1 | Huỷ |
| 2 | Quick Post mode | 🔴 Cao | Thấp–TB | 1 | [x] Done |
| 3 | "Acc đang hot" từ requests | 🔴 Cao | Thấp | 1 | [x] Done |
| 4 | Referral tracking | 🟡 TB-Cao | Thấp | 2 | [x] Done |
| 5 | Landing tuyển CTV | 🟡 TB-Cao | TB | 2 | [x] Done |
| 6 | OG image per account | 🟡 TB | Thấp | 3 | [x] Đã có |
| 7 | Description + Tags | 🟡 TB | TB | 3 | [x] Description done, Tags chưa |
| 8 | Bảng xếp hạng CTV | 🟡 TB | Thấp | 1 | [x] Done |
| 9 | SEO pages + sitemap | 🟡 TB | TB | 3 | Sitemap done, Pages chưa |
| 10 | Onboarding checklist | 🟢 TB | TB | 2 | [ ] |

---

## Changelog

| Ngày | Thay đổi |
|------|----------|
| 2026-03-27 | Khởi tạo roadmap, phân tích hiện trạng & đề xuất 4 phase |
| 2026-03-27 | ~~Hoàn thành 1.1 Auto-pricing~~ → Huỷ: định giá cần con người phân tích thẻ/cầu thủ |
| 2026-03-27 | Hoàn thành 1.2 Quick Post: mode toggle + "Tạo acc tương tự" + duplicate via `?from=ID` |
| 2026-03-27 | Hoàn thành 1.3: `CTVLeaderboard`, `HotRequests`, `SidebarStats` |
| 2026-03-27 | Hoàn thành 2.1: Landing CTV nâng cấp (thu nhập mẫu, so sánh, FAQ, CTA) |
| 2026-03-27 | Hoàn thành 2.2: Referral tracking (`referred_by` + `?ref=` param) |
| 2026-03-27 | Hoàn thành 3.2: Field `description` cho accounts + migration |
| 2026-03-27 | Cập nhật 3.3: Thêm /faq, /seller/apply vào sitemap |
| 2026-03-27 | Huỷ 1.1: Auto-pricing không khả thi (cần phân tích thẻ/cầu thủ thủ công) |
| 2026-03-27 | Hoàn thành 4.5: PWA — manifest, service worker, icons, Apple meta tags |
