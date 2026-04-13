import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
// import Header from '@/components/header';
import Footer from '@/components/footer';

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
          {/* <Header /> */}
          <main className="flex-1 p-6 pb-20">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
