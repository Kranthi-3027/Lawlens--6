import type { Part } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { extractTextWithOCR } from '../services/ocr';

// Use local worker file served from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export interface FileProcessResult {
    part: Part;
    systemMessage?: string; // Error or info message to display between user and AI
}

export const isSupportedFile = (file: File): boolean => {
    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const supportedDocTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
    ];
    return supportedImageTypes.includes(file.type) || supportedDocTypes.includes(file.type);
};

export const fileToGenerativePart = async (file: File): Promise<FileProcessResult> => {
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const text = getDocxText(file);
        return { 
            part: { text },
            systemMessage: `📄 Document uploaded: ${file.name}`
        };
    }

    if (file.type === 'application/pdf') {
        const text = await getPdfText(file);
        
        // Check if it's an error
        if (text.startsWith('ERROR:')) {
            return {
                part: { text: `User uploaded: ${file.name}` },
                systemMessage: `⚠️ ${text}`
            };
        }
        
        return { 
            part: { text },
            systemMessage: `📄 PDF uploaded: ${file.name}`
        };
    }
    
    const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });

    return {
        part: {
            inlineData: {
                mimeType: file.type,
                data: base64EncodedData,
            },
        },
        systemMessage: `🖼️ Image uploaded: ${file.name}`
    };
};


// Mock function for DOCX content extraction
const getDocxText = (file: File): string => {
  return `--- MOCK DOCUMENT CONTENT ---\nFile: ${file.name}\n\nThis is a placeholder for the content of your Word document. In a real application, this text would be extracted from the DOCX file. You can now ask questions about this document as if its full content were present.\n\nKey areas of focus for legal documents:\n- Definitions: Check how key terms are defined.\n- Obligations and Responsibilities: Who is required to do what?\n- Payment Terms: Amounts, due dates, and penalties for late payment.\n- Term and Termination: How long does the agreement last, and how can it be ended?\n- Liability and Indemnification: Who is responsible if something goes wrong?\n- Confidentiality: Are there any clauses about keeping information private?\n--- END MOCK CONTENT ---`;
};

// Real function for PDF content extraction using PDF.js with OCR fallback
const getPdfText = async (file: File): Promise<string> => {
    try {
        console.log('Starting PDF extraction for:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF loaded, pages:', pdf.numPages);
        
        let fullText = '';

        // Extract text from each page using PDF.js
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
            console.log(`Extracted page ${pageNum}, length:`, pageText.length);
        }

        const result = fullText.trim();
        console.log('Total extracted text length:', result.length);
        
        // If no text found, try OCR
        if (result.length === 0 || result.replace(/---\s*Page\s*\d+\s*---/g, '').trim().length < 50) {
            console.log('No meaningful text found with PDF.js, trying OCR...');
            const ocrText = await extractTextWithOCR(file);
            
            if (ocrText && ocrText.length > 0) {
                console.log('OCR extraction successful, length:', ocrText.length);
                return ocrText;
            }
            
            return `ERROR: This PDF is image-based or scanned. OCR extraction failed. The document cannot be read.`;
        }
        
        return result;
    } catch (error: any) {
        console.error('Error extracting PDF text:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // Try OCR as final fallback
        console.log('PDF.js failed, trying OCR as fallback...');
        const ocrText = await extractTextWithOCR(file);
        
        if (ocrText && ocrText.length > 0) {
            console.log('OCR extraction successful after PDF.js failure, length:', ocrText.length);
            return ocrText;
        }
        
        return `ERROR: Unable to read this PDF. It may be encrypted, corrupted, or image-based. OCR extraction also failed.`;
    }
};
