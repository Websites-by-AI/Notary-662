import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'دفتر اسناد رسمی 662 تهران - دستیار هوشمند حقوقی و تنظیم سند',
  description: 'دستیار هوشمند حقوقی دفتر اسناد رسمی ۶۶۲ تهران، ابزاری قدرتمند برای متخصصان حقوقی و عموم مردم جهت تنظیم پیش‌نویس اسناد، تحقیق در موضوعات حقوقی و یافتن وکلای متخصص.',
  icons: {
    icon: 'https://www.notary662th.ir/wp-content/uploads/2020/09/LFZ-lOGO-150x150.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
