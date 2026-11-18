import { Toaster } from '../components/ui/toast';
import { Providers } from '../providers';
import { tsrFactory } from '../server/tsr-factory';
import './global.css';

export const metadata = {
  title: 'Inventory Manager',
  description: 'A place for managing your inventory'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tsr = await tsrFactory();
  const adminStatus = await tsr.user.getAdminStatus.query();

  return (
    <html lang="en">
      <Providers
        adminStatus={
          adminStatus.status === 200 ? adminStatus.body : { admin: false, superAdmin: false }
        }
      >
        <body>
          {children}
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
