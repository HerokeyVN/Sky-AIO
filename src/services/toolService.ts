import type { Tool } from '../models/tool'

export class ToolService {
  getTools(): Tool[] {
    return [
      {
        id: 'qr-height',
        name: 'Đo chiều cao từ QR',
        description: 'Tải ảnh hoặc dùng camera để đọc QR và hiển thị chiều cao nhanh chóng.',
        status: 'available',
        cta: 'Mở công cụ',
        icon: 'qr',
      },
      {
        id: 'skycheckscam',
        name: 'Sky Check Scam',
        description: 'Nền tảng bảo vệ SkyKid khỏi scam/giao dịch gian lận. Vào web để báo cáo và kiểm tra.',
        status: 'available',
        cta: 'Mở trang',
        icon: 'star',
        externalUrl: 'https://skycheckscam.com/',
      },
      {
        id: 'sky-auto-piano',
        name: 'Sky Auto Piano (PC)',
        description: 'Tự động chơi piano trong Sky từ file sheet, hỗ trợ tốc độ và tùy chỉnh keymap.',
        status: 'available',
        cta: 'Mở GitHub',
        icon: 'music',
        externalUrl: 'https://github.com/HerokeyVN/Sky-Auto-Piano',
      },
      {
        id: 'sheet-to-image',
        name: 'Sheet TXT → Hình ảnh',
        description: 'Chuyển đổi định dạng sheet TXT thành hình ảnh cho SkyKid (coming soon).',
        status: 'planned',
        cta: 'Đang hoàn thiện',
        icon: 'sheet',
      }
    ]
  }
}

export const toolService = new ToolService()
