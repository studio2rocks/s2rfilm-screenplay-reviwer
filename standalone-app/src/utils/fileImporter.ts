import mammoth from 'mammoth';
import JSZip from 'jszip';
import { ScriptMetadata } from '../types/script';

export interface ImportResult {
  text: string;
  inferredMetadata: Partial<ScriptMetadata>;
  fileName: string;
}

export async function importScriptFile(file: File): Promise<ImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let extractedText = '';

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value;
  } else if (extension === 'epub') {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const textPieces: string[] = [];

    // Look for HTML/XHTML files in EPUB
    const fileEntries = Object.keys(zip.files).filter(name => 
      /\.(html|xhtml|htm|xml)$/i.test(name) && !name.includes('toc')
    );

    for (const entryName of fileEntries) {
      const fileData = zip.file(entryName);
      if (fileData) {
        const content = await fileData.async('text');
        // Strip basic HTML tags
        const clean = content
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '\n')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\n\s*\n/g, '\n\n');
        textPieces.push(clean);
      }
    }
    extractedText = textPieces.join('\n\n');
  } else {
    // .txt, .fountain, .fdx, etc.
    extractedText = await file.text();
    // If it is FDX (Final Draft XML), extract Paragraph text
    if (extension === 'fdx' || extractedText.includes('<?xml') && extractedText.includes('<FinalDraft')) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(extractedText, 'text/xml');
      const paragraphs = xmlDoc.getElementsByTagName('Paragraph');
      const lines: string[] = [];
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const pType = p.getAttribute('Type') || '';
        const texts = p.getElementsByTagName('Text');
        let lineText = '';
        for (let j = 0; j < texts.length; j++) {
          lineText += texts[j].textContent || '';
        }
        if (pType === 'Scene Heading') {
          lines.push(`\n${lineText.trim()}\n`);
        } else if (pType === 'Character') {
          lines.push(`\n${lineText.trim()}`);
        } else if (pType === 'Parenthetical') {
          lines.push(`(${lineText.trim()})`);
        } else {
          lines.push(lineText.trim());
        }
      }
      extractedText = lines.join('\n');
    }
  }

  // Infer basic metadata from filename and first lines
  const rawTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const title = rawTitle.toUpperCase();

  // Try to find author in first 10 lines
  const firstLines = extractedText.split('\n').slice(0, 15);
  let inferredAuthor = 'Screenwriter';
  let inferredGenre = 'Drama / Thriller';

  for (const line of firstLines) {
    const trimmed = line.trim();
    if (/^(by|written by|author:)\s+(.+)/i.test(trimmed)) {
      const match = trimmed.match(/^(by|written by|author:)\s+(.+)/i);
      if (match && match[2]) {
        inferredAuthor = match[2].trim();
      }
    }
  }

  const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
  // Standard screenplay rule of thumb: ~250 words per page
  const estimatedPages = Math.max(1, Math.round(wordCount / 220));

  return {
    text: extractedText.trim(),
    inferredMetadata: {
      title,
      author: inferredAuthor,
      genre: inferredGenre,
      targetFormat: estimatedPages > 65 ? 'Feature Film' : estimatedPages > 35 ? 'TV Drama Pilot' : 'Short Film',
      estimatedPages
    },
    fileName: file.name
  };
}
