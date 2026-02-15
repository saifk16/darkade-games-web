'use client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Page ko refresh karein taaki login button wapas aa jaye
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600"
    >
      Logout
    </button>
  );
}