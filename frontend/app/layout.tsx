import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutClientShell from '@/components/layout/LayoutClientShell';

export const metadata = {
  title: 'Global Lenz',
  description: 'ニュース比較アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <LayoutClientShell>{children}</LayoutClientShell>
        </AuthProvider>
      </body>
    </html>
  );
}
