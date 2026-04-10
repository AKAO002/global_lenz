import './globals.css';
// import Footer from '@/components/Footer';

export const metadata = {
  title: 'Global Lens',
  description: 'ニュース比較アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main className="min-h-screen p-6">{children}</main>

        {/* <Footer /> */}
      </body>
    </html>
  );
}
