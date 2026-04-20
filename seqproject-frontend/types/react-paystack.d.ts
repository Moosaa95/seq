declare module 'react-paystack' {
    export interface PaystackProps {
        publicKey: string;
        email: string;
        amount: number;
        reference?: string;
        metadata?: any;
        currency?: string;
        channels?: string[];
        label?: string;
        firstname?: string;
        lastname?: string;
        onSuccess?: (reference: any) => void;
        onClose?: () => void;
        subaccount?: string;
        transaction_charge?: number;
        bearer?: string;
        className?: string;
        text?: string;
        children?: React.ReactNode;
    }

    export const PaystackButton: React.FC<PaystackProps>;

    export interface PaystackHookConfig {
        publicKey: string;
        email: string;
        amount: number;
        ref?: string;
        reference?: string;
        metadata?: any;
        currency?: string;
        channels?: string[];
        label?: string;
        firstname?: string;
        lastname?: string;
        subaccount?: string;
        transaction_charge?: number;
        bearer?: string;
        onSuccess?: (reference: any) => void;
        onClose?: () => void;
    }

    export function usePaystackPayment(config: PaystackHookConfig): (onSuccess?: (reference: any) => void, onClose?: () => void) => void;

    export interface PaystackHook {
        initializePayment: (config: PaystackHookConfig) => void;
        onSuccess?: (reference: any) => void;
        onClose?: () => void;
    }

    export function usePaystack(): {
        initializePayment: (config: PaystackHookConfig) => void;
        isLoaded: boolean;
    };
}
