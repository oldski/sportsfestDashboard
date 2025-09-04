import { redirect } from 'next/navigation';

export default function AdminRootPage(): never {
  return redirect('/admin/dashboard');
}