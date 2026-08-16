/**
 * Utility functions for parsing URL links and generating embeddable preview URLs.
 */

export interface EmbedInfo {
  embedUrl: string;
  type: 'gdrive' | 'youtube' | 'canva' | 'pdf' | 'generic';
  label: string;
}

export function getEmbedInfo(url: string | undefined | null): EmbedInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Google Drive File (PDF, Doc, Sheet, Slide, etc.)
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    const fileId = driveFileMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      type: 'gdrive',
      label: 'Google Drive PDF / Document'
    };
  }

  const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    return {
      embedUrl: `https://docs.google.com/document/d/${docMatch[1]}/preview`,
      type: 'gdrive',
      label: 'Google Docs'
    };
  }

  const presentationMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presentationMatch) {
    return {
      embedUrl: `https://docs.google.com/presentation/d/${presentationMatch[1]}/embed`,
      type: 'gdrive',
      label: 'Google Slides'
    };
  }

  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) {
    return {
      embedUrl: `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`,
      type: 'gdrive',
      label: 'Google Sheets'
    };
  }

  // 2. YouTube
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      type: 'youtube',
      label: 'YouTube Video'
    };
  }

  // 3. Canva
  if (trimmed.includes('canva.com')) {
    let canvaUrl = trimmed;
    if (canvaUrl.includes('/view')) {
      canvaUrl = canvaUrl.replace('/view', '/watch?embed');
    } else if (!canvaUrl.includes('embed')) {
      canvaUrl = `${canvaUrl}?embed`;
    }
    return {
      embedUrl: canvaUrl,
      type: 'canva',
      label: 'Canva Presentation'
    };
  }

  // 4. Direct PDF URL
  if (trimmed.toLowerCase().includes('.pdf')) {
    return {
      embedUrl: `https://docs.google.com/gview?url=${encodeURIComponent(trimmed)}&embedded=true`,
      type: 'pdf',
      label: 'PDF Document'
    };
  }

  // 5. Fallback generic website preview using Google Docs viewer
  return {
    embedUrl: `https://docs.google.com/gview?url=${encodeURIComponent(trimmed)}&embedded=true`,
    type: 'generic',
    label: 'Web Link'
  };
}
