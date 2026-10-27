import React from 'react';
import KunturBlob from './KunturBlob';
import ZeoBlob from './ZeoBlob';

/**
 * MascotAvatar - Unified Component for HALO La Paz Mascots.
 * Supports:
 * - 'kuntur': Andean Condor Guardian (Minimalist Teal/Amber)
 * - 'zeo': La Paz Civic Zebra Educator (Minimalist Black & White)
 */
export default function MascotAvatar({ mascot = 'kuntur', ...props }) {
  if (mascot === 'zeo') {
    return <ZeoBlob {...props} />;
  }
  return <KunturBlob {...props} />;
}
