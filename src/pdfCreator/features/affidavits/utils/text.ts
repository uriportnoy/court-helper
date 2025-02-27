import { DeclarationData } from 'pdfCreator/types';

export const getAffidavitText = (data: DeclarationData): string => {
  const type = data.comment || 'תגובתי';
  return `אני הח"מ, ${data.name}, ת.ז. ${data.id} לאחר שהוזהרתי כי עליי להצהיר את האמת וכי אהיה צפוי לעונשים הקבועים בחוק אם לא אעשה כן, מצהיר בזה כי כל העובדות המפורטות ב${type} מיום ${data.date}, אמת ונכון.`;
};

export const getLawyerText = (data: DeclarationData): string => {
  if (data.isRemote) {
    return `אני הח"מ, עו"ד ${data.lawyer}, מאשר בזאת כי ביום ${data.date} הופיע בפני באמצעות היוועדות חזותית מר ${data.name}, ת.ז. ${data.id}, ולאחר שהזהרתיו כי עליו להצהיר את האמת ויהא צפוי לעונשים הקבועים בחוק אם לא יעשה כן, אישר את נכונות הצהרתו דלעיל וחתם עליה בפני.`;
  }

  return `אני הח"מ, עו"ד ${data.lawyer}, מאשר בזאת כי ביום ${data.date} הופיע בפני מר ${data.name}, ת.ז. ${data.id}, ולאחר שהזהרתיו כי עליו להצהיר את האמת ויהא צפוי לעונשים הקבועים בחוק אם לא יעשה כן, אישר את נכונות הצהרתו דלעיל וחתם עליה בפני.`;
};
