import React, { useState } from 'react';
import { useUser } from '@/lib/AuthContext';
import axiosInstance from '@/lib/axiosinstance';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PricingPage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const planWeights: Record<string, number> = { 'Free': 0, 'Bronze': 1, 'Silver': 2, 'Gold': 3 };

  const handleUpgrade = async (planType: string) => {
    if (!user) {
      toast.error('Please sign in to upgrade your plan.');
      return;
    }

    const userWeight = planWeights[user.plan || 'Free'];
    const targetWeight = planWeights[planType];

    if (userWeight >= targetWeight) {
      toast.info(`You already have this plan or a higher one!`);
      return;
    }

    try {
      setLoading(planType);
      
      // 1. Create order on the backend
      const { data: orderData } = await axiosInstance.post('/api/payment/create-order', {
        userId: user._id,
        planType: planType
      });

      // 2. Initialize Razorpay modal
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "YouTube Clone",
        description: `Upgrade to ${planType} Plan`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            toast.info("Verifying payment...");
            // 3. Verify payment signature on the backend
            const verifyRes = await axiosInstance.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              planType: planType
            });

            if (verifyRes.status === 200) {
              toast.success(`Successfully upgraded to ${planType} Plan!`);
              // Update user state if context allows, or reload
              if (setUser) setUser(verifyRes.data.user);
              else window.location.reload();
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            toast.error(verifyError.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: user.name || "User",
          email: user.email || "user@example.com",
        },
        theme: {
          color: "#F37254"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong while initiating checkout.');
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (planType: string) => {
    if (loading === planType) return 'Processing...';
    if (user?.plan === planType) return 'Current Plan';
    
    const userWeight = planWeights[user?.plan || 'Free'];
    const currentWeight = planWeights[planType];
    
    if (userWeight > currentWeight) return 'Included';
    return `Upgrade to ${planType}`;
  };

  const isButtonDisabled = (planType: string) => {
    const userWeight = planWeights[user?.plan || 'Free'];
    const currentWeight = planWeights[planType];
    return loading !== null || userWeight >= currentWeight;
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Upgrade your experience
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that suits your needs.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="px-6 py-8 flex-1">
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  $0
                </div>
                <p className="mt-5 text-sm text-gray-500">
                  Perfect for casual viewers.
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50 flex-1 flex flex-col justify-between">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">Watch unlimited videos</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">Download 1 video per day</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300" disabled>
                    {(!user?.plan || user?.plan === 'Free') ? 'Current Plan' : 'Included'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Bronze Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-orange-300 transform md:-translate-y-2 transition-transform">
              <div className="px-6 py-8 flex-1">
                <h3 className="text-2xl font-bold text-orange-600">Bronze</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  $5<span className="text-sm font-medium text-gray-500">/lifetime</span>
                </div>
                <p className="mt-5 text-sm text-gray-500">
                  For regular viewers.
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50 flex-1 flex flex-col justify-between">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700 font-bold">Download 5 videos per day</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button 
                    onClick={() => handleUpgrade('Bronze')} 
                    disabled={isButtonDisabled('Bronze')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {getButtonText('Bronze')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Silver Plan */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border-2 border-gray-400 transform md:-translate-y-4 transition-transform">
              <div className="px-6 py-8 flex-1">
                <h3 className="text-2xl font-bold text-gray-700">Silver</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  $10<span className="text-sm font-medium text-gray-500">/lifetime</span>
                </div>
                <p className="mt-5 text-sm text-gray-500">
                  Great value.
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50 flex-1 flex flex-col justify-between">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700 font-bold">Download 10 videos per day</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button 
                    onClick={() => handleUpgrade('Silver')} 
                    disabled={isButtonDisabled('Silver')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    {getButtonText('Silver')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border-2 border-yellow-400 transform md:-translate-y-4 transition-transform">
              <div className="px-6 py-8 flex-1">
                <h3 className="text-2xl font-bold text-yellow-600">Gold</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  $20<span className="text-sm font-medium text-gray-500">/lifetime</span>
                </div>
                <p className="mt-5 text-sm text-gray-500">
                  The ultimate experience.
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50 flex-1 flex flex-col justify-between">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700 font-bold">Unlimited video downloads</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">Priority support</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button 
                    onClick={() => handleUpgrade('Gold')} 
                    disabled={isButtonDisabled('Gold')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {getButtonText('Gold')}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
