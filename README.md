# Bangkok — oldMyou Tourists 🌏

เว็บไซต์แนะนำสถานที่ท่องเที่ยว คาเฟ่ ร้านค้า และของกินในกรุงเทพฯ พร้อมข้อมูลการเดินทางด้วย BTS / MRT / เรือ

## หน้าเว็บ
| ไฟล์ | รายละเอียด |
|---|---|
| `index.html` | หน้าแรก (hero + navbar) |
| `gallery.html` | รวมสถานที่ท่องเที่ยว (การ์ด + lightbox) |
| `detail.html` | หน้ารายละเอียดสถานที่ |
| `css/style.css` | สไตล์ทั้งหมด (responsive) |
| `js/app.js` | ระบบ gallery, lightbox, แผนที่, ตัวกรอง |
| `pdf/` | แผนที่รถไฟฟ้า BTS / MRT และแผนที่ขนส่งกรุงเทพฯ |

## เปิดใช้งาน
เว็บเป็น static ล้วน เปิด `index.html` ตรง ๆ ได้เลย หรือรันเซิร์ฟเวอร์ท้องถิ่น:

```bash
npx serve .
```

## Deploy
โฮสต์บน GitHub Pages อัตโนมัติเมื่อ push ขึ้น branch `main`
