import axios from 'axios';

const SLIPOK_API_URL = 'https://api.slipok.com/api/line/apikey';

export type SlipVerificationResult = {
    isValid: boolean;
    amount: number;
    date: string;
    time: string;
    sender: string;
    receiver: string;
    transRef: string;
    message?: string; // For error messages
};

export async function verifySlip(imageBuffer: Buffer, branchId: string, apiKey: string): Promise<SlipVerificationResult> {
    try {
        // Option 1: Using form-data with the image buffer directly
        // Create form data using native Node APIs or a package like form-data
        const FormData = require('form-data');
        const form = new FormData();

        // Append the buffer directly, giving it a filename so the API knows it's a file
        form.append('files', imageBuffer, {
            filename: 'slip.jpg',
            contentType: 'image/jpeg',
        });

        // Add headers required by SlipOK (Branch ID and API Key usually sent in headers)
        const headers = {
            'x-authorization': apiKey,
            ...form.getHeaders()
        };

        const response = await axios.post(`${SLIPOK_API_URL}/${branchId}`, form, {
            headers,
            // Don't throw errors on 400 status codes so we can read the validation response
            validateStatus: (status) => status < 500
        });

        const data = response.data;

        // Note: The specific response format depends on SlipOK's API documentation.
        // Assuming a common structure for success/failure:
        if (data.success && data.data) {
            return {
                isValid: true,
                amount: data.data.amount || 0,
                date: data.data.transDate || '',
                time: data.data.transTime || '',
                sender: data.data.sender?.name || 'Unknown',
                receiver: data.data.receiver?.name || 'Unknown',
                transRef: data.data.transRef || 'REF' + Date.now(),
            };
        } else {
            return {
                isValid: false,
                amount: 0,
                date: '',
                time: '',
                sender: '',
                receiver: '',
                transRef: '',
                message: data.message || 'Slip verification failed',
            };
        }
    } catch (error: any) {
        console.error("Slip Verification API Error:", error.response?.data || error.message);
        return {
            isValid: false,
            amount: 0,
            date: '',
            time: '',
            sender: '',
            receiver: '',
            transRef: '',
            message: 'Error communicating with verification service',
        };
    }
}
