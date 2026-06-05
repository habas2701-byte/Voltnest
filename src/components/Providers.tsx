'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={{ clientId: "test", currency: "EUR" }}>
      {children}
    </PayPalScriptProvider>
  );
}
