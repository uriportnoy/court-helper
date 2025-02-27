import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { shareViaEmail, shareViaWhatsApp, copyToClipboard, downloadPDF } from './utils/share.js';

const ShareMenu = ({ url, onClose }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const [shareStatus, setShareStatus] = useState(null);

    const handleCopyLink = async () => {
        const success = await copyToClipboard(url);
        if (success) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleShareViaEmail = () => {
        shareViaEmail(url);
        onClose();
    };

    const handleShareViaWhatsApp = () => {
        shareViaWhatsApp(url);
        onClose();
    };

    const handleShareFile = async () => {
        try {
            setShareStatus('downloading');

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
                setShareStatus('success');
                setTimeout(() => setShareStatus(null), 2000);
                onClose();
            } else {
                // Fallback to download if sharing is not supported
                await downloadPDF(url, filename);
                setShareStatus('success');
                setTimeout(() => setShareStatus(null), 2000);
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            setShareStatus('error');
            setTimeout(() => setShareStatus(null), 2000);
        }
    };

    return (
        <MenuContainer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
        >
            <MenuHeader>
                <h3>Share Document</h3>
                <CloseButton onClick={onClose}>
                    <i className="pi pi-times" />
                </CloseButton>
            </MenuHeader>

            <MenuItems>
                <MenuItem
                    onClick={handleShareFile}
                    disabled={shareStatus === 'downloading'}
                    className={shareStatus ? `status-${shareStatus}` : ''}
                >
                    <i className={`pi ${
                        shareStatus === 'downloading' ? 'pi-spin pi-spinner' :
                            shareStatus === 'success' ? 'pi-check' :
                                shareStatus === 'error' ? 'pi-times' :
                                    'pi-share-alt'
                    }`} />
                    <span>
            {shareStatus === 'downloading' ? 'Preparing...' :
                shareStatus === 'success' ? 'Shared!' :
                    shareStatus === 'error' ? 'Failed' :
                        'Share File'}
          </span>
                </MenuItem>

                <MenuItem onClick={handleShareViaEmail}>
                    <i className="pi pi-envelope" />
                    <span>Email</span>
                </MenuItem>

                <MenuItem onClick={handleShareViaWhatsApp}>
                    <i className="pi pi-whatsapp" />
                    <span>WhatsApp</span>
                </MenuItem>

                <MenuItem onClick={handleCopyLink}>
                    <i className="pi pi-copy" />
                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                </MenuItem>
            </MenuItems>

            <URLDisplay>
                <URLText>{url.substring(0, 40)}...</URLText>
            </URLDisplay>
        </MenuContainer>
    );
};

ShareMenu.propTypes = {
    url: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

const MenuContainer = styled(motion.div)`
  position: absolute;
  top: 60px;
  right: 10px;
  width: 250px;
  background: var(--surface-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--surface-200);
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--surface-900);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--surface-600);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: var(--surface-100);
    color: var(--surface-900);
  }
`;

const MenuItems = styled.div`
  padding: 0.5rem;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--surface-700);
  transition: all 0.2s ease;
  text-align: left;
  
  i {
    font-size: 1.125rem;
    width: 20px;
  }
  
  &:hover:not(:disabled) {
    background: var(--surface-100);
    color: var(--primary-600);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &.status-downloading {
    background: var(--blue-50);
    color: var(--blue-600);
  }
  
  &.status-success {
    background: var(--green-50);
    color: var(--green-600);
  }
  
  &.status-error {
    background: var(--red-50);
    color: var(--red-600);
  }
`;

const URLDisplay = styled.div`
  padding: 0.75rem 1rem;
  background: var(--surface-50);
  border-top: 1px solid var(--surface-200);
`;

const URLText = styled.div`
  font-size: 0.75rem;
  color: var(--surface-600);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ShareMenu;