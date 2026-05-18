import imgIpe from '@/app/assets/images/Ipe_roxo.jpg';
import imgJatoba from '@/app/assets/images/jatoba.jpg';
import imgMogno from '@/app/assets/images/mogno.jpg';
import imgCedro from '@/app/assets/images/Cedro (Cedrela fissilis).jpg';
import imgPeroba from '@/app/assets/images/Peroba Rosa (Aspidosperma polyneuron).jpg';
import imgAroeira from '@/app/assets/images/Aroeira (Myracrodruon urundeuva).webp';

export const treeImagesByNfcId: Record<string, string> = {
  'NFC-IPE-001': imgIpe,
  'NFC-JAT-002': imgJatoba,
  'NFC-MAH-003': imgMogno,
  'NFC-CED-004': imgCedro,
  'NFC-PER-005': imgPeroba,
  'NFC-ARO-006': imgAroeira,
};

export function getTreeImage(treeNfcId?: string): string | undefined {
  return treeNfcId ? treeImagesByNfcId[treeNfcId] : undefined;
}
