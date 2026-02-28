import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suno Split Prompt Builder',
  description: 'Split screen Suno prompt generator with OpenAI integration'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
