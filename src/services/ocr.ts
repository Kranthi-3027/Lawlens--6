// OCR service using Hugging Face Inference API with TrOCR model

const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/trocr-base-printed';

export const extractTextWithOCR = async (file: File): Promise<string> => {
    try {
        const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_HUGGINGFACE_TOKEN_HERE') {
            console.warn('Hugging Face API key not configured.');
            return '';
        }

        console.log('Starting OCR extraction for:', file.name);

        // Send file directly as binary
        const arrayBuffer = await file.arrayBuffer();

        // Call Hugging Face Inference API
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: arrayBuffer
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OCR API error:', response.status, error);
            
            // If model is loading, wait and retry once
            if (response.status === 503) {
                console.log('OCR model is loading, waiting 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Retry once
                const retryResponse = await fetch(HF_API_URL, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    body: arrayBuffer
                });
                
                if (!retryResponse.ok) {
                    console.log('OCR retry failed, skipping');
                    return '';
                }
                
                const retryResult = await retryResponse.json();
                console.log('OCR retry result:', retryResult);
                
                if (retryResult && Array.isArray(retryResult) && retryResult[0]?.generated_text) {
                    return retryResult[0].generated_text;
                }
            }
            
            return '';
        }

        const result = await response.json();
        console.log('OCR result:', result);

        // Extract text from TrOCR response
        if (result && Array.isArray(result) && result[0]?.generated_text) {
            const extractedText = result[0].generated_text;
            console.log('OCR extracted text length:', extractedText.length);
            return extractedText;
        }

        return '';
    } catch (error: any) {
        console.error('OCR extraction failed:', error);
        return '';
    }
};
