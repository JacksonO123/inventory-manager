'use client';

import { Plus } from 'lucide-react';
import { TabGroup, Tab, TabContent, Tabs } from '../../../components/Tabs';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogTrigger } from '../../../components/ui/dialog';

export default function ManageSuperAdminPage() {
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
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button>
                        Add super admin <Plus />
                      </Button>
                    }
                  />
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
