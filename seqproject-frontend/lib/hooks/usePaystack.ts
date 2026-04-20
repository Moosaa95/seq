import { useEffect, useState } from 'react';

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // Amount in kobo (Naira * 100)
  currency?: string;
  ref: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

export function usePaystack() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Paystack script is already loaded
    if (window.PaystackPop) {
      setIsLoaded(true);
      return;
    }

    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializePayment = (config: PaystackConfig) => {
    if (!isLoaded || !window.PaystackPop) {
      console.error('Paystack script not loaded');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: config.publicKey,
      email: config.email,
      amount: config.amount,
      currency: config.currency || 'NGN',
      ref: config.ref,
      metadata: config.metadata,
      callback: (response: any) => {
        config.onSuccess(response);
      },
      onClose: () => {
        config.onClose();
      },
    });

    handler.openIframe();
  };

  return {
    isLoaded,
    initializePayment,
  };
}
