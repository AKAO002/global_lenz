'use client';

import RequireAuth from '@/components/RequireAuth';

export default function TopicPage() {
  return (
    <RequireAuth>
      <div>
        <h1>各国要約</h1>
      </div>
    </RequireAuth>
  );
}
