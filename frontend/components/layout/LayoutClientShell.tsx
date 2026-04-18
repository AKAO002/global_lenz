'use client';

import { useState } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import AboutModal from '@/components/ui/AboutModal';
import UsefulLinksModal from '@/components/modals/UsefulLinksModal';

type LayoutClientShellProps = {
  children: React.ReactNode;
};

export default function LayoutClientShell({ children }: LayoutClientShellProps) {
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <main className="flex-1 overflow-x-hidden bg-brand-canvas p-6 pb-24 text-brand-on-canvas">
        {children}
      </main>
      <BottomNav
        onOpenLinks={() => setIsLinksOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />
      <AboutModal open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <UsefulLinksModal open={isLinksOpen} onClose={() => setIsLinksOpen(false)} />
    </>
  );
}
