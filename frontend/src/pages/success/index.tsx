import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/AuthContext';

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const { fetchUser } = useUser();

  useEffect(() => {
    // Re-fetch the user so that the 'Premium' plan is reflected in the frontend state immediately
    if (fetchUser) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <div className="flex-1 min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for upgrading to Premium. You now have unlimited access to video downloads.
        </p>
        <Button 
          onClick={() => router.push('/')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
