import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, GraduationCap, Home } from 'lucide-react';
import { Link } from 'wouter';

export default function PaymentSuccess() {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('donation');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    const typeParam = urlParams.get('type');

    if (amountParam) setAmount(amountParam);
    if (typeParam) setType(typeParam);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            {type === 'donation' ? 'Thank You!' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {type === 'donation' 
              ? `Your $${amount} donation has been processed successfully`
              : `Your $${amount} payment has been completed`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {type === 'donation' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Your Impact</h3>
              </div>
              <p className="text-sm text-blue-700">
                Your donation directly supports educational trips for underprivileged students 
                in Corpus Christi, Texas. Every dollar makes a difference in a young person's life.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {type === 'donation' 
                ? 'You will receive a donation receipt via email shortly.'
                : 'You will receive a payment confirmation via email shortly.'
              }
            </p>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
              
              {type === 'donation' && (
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Heart className="w-4 h-4 mr-2" />
                    Share Our Mission
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-4">
            <p>Champions for Change</p>
            <p>champions4change361@gmail.com | 361-300-1552</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}