import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { ItemPreviewProps } from "../types";
import { itemStyles } from "../styles/item";

export const ItemPreview: React.FC<ItemPreviewProps> = ({ page }) => {
  return (
    <Page size="A4" style={itemStyles.page}>
      <View style={itemStyles.container}>
        <Text style={itemStyles.title}>נספח {page.position}</Text>
        <Text style={itemStyles.content}>{page.description}</Text>
      </View>
    </Page>
  );
};
