import React from 'react';
import { TablePreviewProps } from '../types';
import { getSortedPages } from '../../items/utils/sorting';
import { tableStyles } from '../styles/table';
import { Page, View, Text } from '@react-pdf/renderer';

export const TablePreview: React.FC<TablePreviewProps> = ({ pages, className }) => {
  const sortedPages = getSortedPages(pages);

  return (
    <Page size="A4" style={tableStyles.page}>
      <View style={tableStyles.container}>
        <View style={tableStyles.header}>
          <Text style={tableStyles.title}>רשימת נספחים</Text>
          <View style={tableStyles.titleUnderline} />
        </View>

        <View style={tableStyles.table}>
          <View style={[tableStyles.row, tableStyles.headerRow]}>
            <View style={[tableStyles.cell, tableStyles.indexCell]}>
              <Text style={tableStyles.headerCell}>נספח</Text>
            </View>
            <View style={[tableStyles.cell, tableStyles.descriptionCell]}>
              <Text style={tableStyles.headerCell}>תיאור</Text>
            </View>
            <View style={[tableStyles.cell, tableStyles.pageCell]}>
              <Text style={tableStyles.headerCell}>עמוד</Text>
            </View>
          </View>

          {sortedPages.map((page, index) => (
            <View 
              key={page.id} 
              style={[
                tableStyles.row,
                index === sortedPages.length - 1 && tableStyles.lastRow
              ]}
            >
              <View style={[tableStyles.cell, tableStyles.indexCell]}>
                <Text style={tableStyles.contentCell}>{page.position}</Text>
              </View>
              <View style={[tableStyles.cell, tableStyles.descriptionCell]}>
                <Text style={tableStyles.contentCell}>{page.description}</Text>
              </View>
              <View style={[tableStyles.cell, tableStyles.pageCell]}>
                <Text style={tableStyles.contentCell}>{page.pageNumber}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
};