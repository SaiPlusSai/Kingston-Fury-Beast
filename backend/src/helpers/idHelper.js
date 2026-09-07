const { v4: uuidv4 } = require('uuid');

const generateId = (prefix = '') => {
  const id = uuidv4();
  return prefix ? `${prefix}-${id}` : id;
};

const normalizeCityCode = (cityCode = 'UNK') => {
  const normalized = String(cityCode || 'UNK')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return normalized || 'UNK';
};

const getCategoryPrefix = (category) => {
  if (!category) return 'INC';
  const c = category.toLowerCase();
  if (c.includes('incendio')) return 'INC';
  if (c.includes('inundacion') || c.includes('inundación')) return 'INU';
  if (c.includes('delito') || c.includes('robo')) return 'DEL';
  if (c.includes('accidente')) return 'ACC';
  if (c.includes('bloqueo')) return 'BLO';
  return 'OTR';
};

const generateReportId = (category, cityCode, sequence) => {
  const prefix = getCategoryPrefix(category);
  const normalizedCity = normalizeCityCode(cityCode);
  const paddedSequence = String(sequence || 1).padStart(2, '0');
  return `${prefix}_${normalizedCity}_${paddedSequence}`;
};

const generateLegacyReportId = () => generateId('INC');
const generateUserId = () => generateId('USR');
const generateNotificationId = () => generateId('NTF');
const generateActivityId = () => generateId('ACT');

module.exports = {
  generateId,
  generateReportId,
  generateLegacyReportId,
  normalizeCityCode,
  generateUserId,
  generateNotificationId,
  generateActivityId,
};
