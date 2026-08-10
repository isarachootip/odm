import { getPaymentConfigs } from "@/actions/payment-config";
import PaymentConfigClient from "@/components/admin/PaymentConfigClient";

export const dynamic = "force-dynamic";

export default async function BankConfigPage() {
    const configs = await getPaymentConfigs();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payment Settings</h1>
                <p className="text-sm text-gray-500">Configure receiving accounts for QR Code (PromptPay / Bank Transfer)</p>
            </div>

            <PaymentConfigClient initialConfigs={configs} />
        </div>
    );
}
