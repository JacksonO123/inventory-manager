'use client';

import { Plus } from 'lucide-react';
import { TabGroup, Tab, TabContent, Tabs } from '../../../components/Tabs';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../components/ui/dialog';
import { NewAdminForm } from '../../../components/NewAdminForm';
import { useState } from 'react';

export default function ManageSuperAdminPage() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [superAdminOpen, setSuperAdminOpen] = useState(false);

  function handleCheckValidEmail(email: string) {}

  return (
    <main className="flex justify-center pt-20">
      <div className="w-full max-w-3xl p-4 rounded-md border">
        <Tabs onTabChange={() => {}}>
          <TabGroup className="absolute">
            <Tab value="super-admin">Super Admin</Tab>
            <Tab value="admin">Admin</Tab>
          </TabGroup>
          <div>
            <TabContent tab="super-admin">
              <div className="w-full flex justify-end">
                <Dialog open={superAdminOpen} onOpenChange={setSuperAdminOpen}>
                  <DialogTrigger
                    render={
                      <Button>
                        Add super admin <Plus />
                      </Button>
                    }
                  />
                  <DialogContent className="max-w-md! w-md!" showCloseButton={false}>
                    <DialogHeader>
                      <DialogTitle>
                        Enter email of new{' '}
                        <span className="text-primary font-bold">super admin</span>
                      </DialogTitle>
                    </DialogHeader>
                    <NewAdminForm
                      onCancel={() => setSuperAdminOpen(false)}
                      onSubmit={() => {}}
                      externalValidator={handleCheckValidEmail}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </TabContent>
            <TabContent tab="admin">
              <div className="w-full flex justify-end">
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button>
                        Add admin <Plus />
                      </Button>
                    }
                  />
                </Dialog>
              </div>
            </TabContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
