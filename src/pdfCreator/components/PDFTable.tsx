import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { Page as PageType } from "../types";
import { tableStyles } from "../styles/pdf/table";

interface PDFTableProps {
  pages: PageType[];
}

const PDFTable: React.FC<PDFTableProps> = (
  { pages } = {
    pages: [],
  },
) => {
  const sortedPages = [...pages].sort((a, b) => a.position - b.position);

  return (
    <Page size="A4" style={tableStyles.page}>
      <View style={tableStyles.container}>
        {/* <View style={tarbleStyles.header}>
          <Text style={tableStyles.title}>רשימת נספחים</Text>
          <View style={tableStyles.titleUnderline} />
        </View> */}

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
                index === sortedPages.length - 1 && tableStyles.lastRow,
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

export default PDFTable;
