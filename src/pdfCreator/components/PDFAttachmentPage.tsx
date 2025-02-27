import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { Page as PageType } from '../types';
import { attachmentStyles } from '../styles/pdf/attachment';

interface PDFAttachmentPageProps {
  page: PageType;
}

const PDFAttachmentPage: React.FC<PDFAttachmentPageProps> = ({ page }) => {
  return (
    <Page size="A4" style={attachmentStyles.page}>
      <View style={attachmentStyles.container}>
        <Text style={attachmentStyles.title}>
          נספח {page.position}
        </Text>
        <Text style={attachmentStyles.content}>{page.description}</Text>
      </View>
    </Page>
  );
};

export default PDFAttachmentPage;