import { Toaster } from '../components/ui/toast';
import { Providers } from '../providers';
import { LayoutHeader } from './components/LayoutHeader';
import './global.css';

export const metadata = {
  title: 'Inventory Manager',
  description: 'A place for managing your inventory'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Providers>
        <body>
          <LayoutHeader />
          {children}
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
