import type { Part } from '../types';

export const isSupportedFile = (file: File): boolean => {
    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const supportedDocTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return supportedImageTypes.includes(file.type) || supportedDocTypes.includes(file.type);
};

export const fileToGenerativePart = async (file: File): Promise<Part> => {
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const text = getDocxText(file);
        return { text: `User uploaded a document named "${file.name}". The extracted content is:\n\n${text}` };
    }
    
    const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            mimeType: file.type,
            data: base64EncodedData,
        },
    };
};


// Mock function for DOCX content extraction
const getDocxText = (file: File): string => {
  return `--- MOCK DOCUMENT CONTENT ---\nFile: ${file.name}\n\nThis is a placeholder for the content of your Word document. In a real application, this text would be extracted from the DOCX file. You can now ask questions about this document as if its full content were present.\n\nKey areas of focus for legal documents:\n- Definitions: Check how key terms are defined.\n- Obligations and Responsibilities: Who is required to do what?\n- Payment Terms: Amounts, due dates, and penalties for late payment.\n- Term and Termination: How long does the agreement last, and how can it be ended?\n- Liability and Indemnification: Who is responsible if something goes wrong?\n- Confidentiality: Are there any clauses about keeping information private?\n--- END MOCK CONTENT ---`;
};
