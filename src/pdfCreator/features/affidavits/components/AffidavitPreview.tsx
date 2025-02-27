import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { AffidavitPreviewProps } from '../types';
import { affidavitStyles } from '../styles/affidavit';
import { commonStyles } from '../../../styles/pdf/common';
import { getAffidavitText, getLawyerText } from '../utils/text';

export const AffidavitPreview: React.FC<AffidavitPreviewProps> = ({ data }) => {
  return (
    <Page size="A4" style={commonStyles.page}>
      <View style={commonStyles.titleContainer}>
        <Text style={affidavitStyles.subtitle}>תצהיר</Text>
        <View style={affidavitStyles.subtitleUnderline} />
      </View>
      <Text style={affidavitStyles.content}>{getAffidavitText(data)}</Text>
      <View style={commonStyles.signatureContainer}>
        {data.withSignature && (
          <Image
            src={`/signatures/uri.png`}
            style={[
              commonStyles.signature,
              {
                transform: `rotate(${getRandomPosition(-10, 10)})`,
                width: '200px',
              },
            ]}
          />
        )}
        <View style={commonStyles.signatureLine} />
        <Text style={commonStyles.signatureText}>{data.name}</Text>
        <Text style={commonStyles.signatureText}>{`ת.ז. ${data.id}`}</Text>
      </View>
      <>
        <View style={{ marginTop: 60 }}>
          <Text style={affidavitStyles.subtitle}>אישור</Text>
          <View style={affidavitStyles.subtitleUnderline} />
        </View>
        <Text style={affidavitStyles.content}>{getLawyerText(data)}</Text>
        <View style={commonStyles.signatureContainer}>
          {data.withSignature && (
            <Image
              src={`/signatures/tby.png`}
              style={[
                commonStyles.signature,
                {
                  transform: `rotate(${getRandomPosition(-20, 20)})`,
                  width: '280px',
                  top: `${getRandomPosition(-30, 0)}px`,
                  left: `${getRandomPosition(-60, -10)}px`,
                },
              ]}
            />
          )}
          <View style={commonStyles.signatureLine} />
          <Text style={commonStyles.signatureText}>חתימת עורך דין</Text>
        </View>
      </>
    </Page>
  );
};

function getRandomPosition(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
