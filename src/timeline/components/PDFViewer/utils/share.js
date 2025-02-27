/**
 * Utility functions for downloading and sharing PDF files
 */

/**
 * Downloads a PDF file from a URL
 * @param {string} url - The URL of the PDF file
 * @param {string} [filename] - Optional custom filename (defaults to extracted from URL)
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const downloadPDF = async (url, filename) => {
    try {
        // Fetch the PDF file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Create a download link
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Set filename - either use provided name or extract from URL
        let defaultFilename = url.split('/').pop().split('?')[0] || 'document';

        // Ensure filename has .pdf extension
        if (!defaultFilename.toLowerCase().endsWith('.pdf')) {
            defaultFilename += '.pdf';
        }

        // If custom filename is provided, ensure it has .pdf extension
        if (filename) {
            if (!filename.toLowerCase().endsWith('.pdf')) {
                filename += '.pdf';
            }
        }

        link.download = filename || defaultFilename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        return false;
    }
};

/**
 * Shares a PDF via email
 * @param {string} url - The URL of the PDF file
 * @param {string} [subject] - Optional email subject
 * @param {string} [body] - Optional email body
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const shareViaEmail = async (url, subject = 'Shared PDF Document', body = 'Please find the attached PDF document.') => {
    try {
        // Try to fetch and attach the actual PDF file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Extract filename from URL for better context in the email
        let filename = url.split('/').pop().split('?')[0] || 'document.pdf';

        // Ensure filename has .pdf extension for clarity in the email
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }

        // Check if Web Share API with files is available
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'application/pdf' })] })) {
            await navigator.share({
                files: [new File([blob], filename, { type: 'application/pdf' })],
                title: subject,
                text: body
            });
            return true;
        } else {
            // Fallback to mailto link
            const enhancedBody = `${body}\n\nDocument: ${filename}\n${url}`;
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enhancedBody)}`;
            window.open(mailtoLink, '_blank');
            return true;
        }
    } catch (error) {
        console.error('Error sharing via email:', error);

        // Fallback to simple mailto link with URL only
        try {
            // Extract filename from URL for better context in the email
            let filename = url.split('/').pop().split('?')[0] || 'document.pdf';

            // Ensure filename has .pdf extension for clarity in the email
            if (!filename.toLowerCase().endsWith('.pdf')) {
                filename += '.pdf';
            }

            const enhancedBody = `${body}\n\nDocument: ${filename}\n${url}`;
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enhancedBody)}`;
            window.open(mailtoLink, '_blank');
            return true;
        } catch (fallbackError) {
            console.error('Error with email fallback:', fallbackError);
            return false;
        }
    }
};

/**
 * Shares a PDF via WhatsApp
 * @param {string} url - The URL of the PDF file
 * @param {string} [message] - Optional message to include
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const shareViaWhatsApp = async (url, message = 'Check out this PDF document:') => {
    try {
        // Try to fetch the actual PDF file first
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Extract filename from URL for better context in the message
        let filename = url.split('/').pop().split('?')[0] || 'document.pdf';

        // Ensure filename has .pdf extension for clarity in the message
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }

        // Check if Web Share API with files is available
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'application/pdf' })] })) {
            await navigator.share({
                files: [new File([blob], filename, { type: 'application/pdf' })],
                title: 'Shared PDF Document',
                text: message
            });
            return true;
        } else {
            // Fallback to WhatsApp web link
            const enhancedMessage = `${message} ${filename}\n${url}`;
            const whatsappLink = `https://wa.me/?text=${encodeURIComponent(enhancedMessage)}`;
            window.open(whatsappLink, '_blank');
            return true;
        }
    } catch (error) {
        console.error('Error sharing via WhatsApp:', error);

        // Fallback to simple WhatsApp link with URL only
        try {
            // Extract filename from URL for better context in the message
            let filename = url.split('/').pop().split('?')[0] || 'document.pdf';

            // Ensure filename has .pdf extension for clarity in the message
            if (!filename.toLowerCase().endsWith('.pdf')) {
                filename += '.pdf';
            }

            const enhancedMessage = `${message} ${filename}\n${url}`;
            const whatsappLink = `https://wa.me/?text=${encodeURIComponent(enhancedMessage)}`;
            window.open(whatsappLink, '_blank');
            return true;
        } catch (fallbackError) {
            console.error('Error with WhatsApp fallback:', fallbackError);
            return false;
        }
    }
};

/**
 * Copies the PDF URL to clipboard
 * @param {string} url - The URL to copy
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const copyToClipboard = async (url) => {
    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);

        // Fallback for browsers that don't support clipboard API
        try {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (fallbackError) {
            console.error('Error with clipboard fallback:', fallbackError);
            return false;
        }
    }
};

/**
 * Shares a PDF file using the Web Share API
 * @param {string} url - The URL of the PDF file
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const shareFile = async (url) => {
    try {
        // Fetch the PDF file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Extract filename from URL
        let filename = url.split('/').pop().split('?')[0] || 'document.pdf';
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }

        // Create file object for sharing
        const file = new File([blob], filename, { type: 'application/pdf' });

        // Check if Web Share API is available
        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Shared PDF Document',
                text: 'Please check this PDF document'
            });
            return true;
        } else {
            // Fallback to download if sharing is not supported
            return await downloadPDF(url, filename);
        }
    } catch (error) {
        console.error('Error sharing file:', error);
        return false;
    }
};