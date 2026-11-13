import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { FullCoverageReport } from '../types/script';

/**
 * Downloads a Blob as a file in the browser
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports the Full Hollywood Coverage Report as a professional Microsoft Word (.docx) document
 */
export async function exportCoverageReportToDocx(coverage: FullCoverageReport): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'S2RFilm Studio — Professional Hollywood Coverage Report',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'TITLE: ', bold: true }),
              new TextRun({ text: coverage.metadata.title, bold: true, color: '1e3a8a' }),
              new TextRun({ text: '    |    AUTHOR: ', bold: true }),
              new TextRun({ text: coverage.metadata.author }),
              new TextRun({ text: '    |    FORMAT: ', bold: true }),
              new TextRun({ text: coverage.metadata.targetFormat })
            ],
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'GENRE: ', bold: true }),
              new TextRun({ text: coverage.metadata.genre }),
              new TextRun({ text: '    |    PAGES: ', bold: true }),
              new TextRun({ text: `${coverage.metadata.estimatedPages} pp.` }),
              new TextRun({ text: '    |    DATE: ', bold: true }),
              new TextRun({ text: coverage.timestamp })
            ],
            spacing: { after: 240 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'EXECUTIVE VERDICT: ', bold: true, size: 28 }),
              new TextRun({ text: coverage.verdict, bold: true, size: 28, color: coverage.verdict === 'RECOMMEND' ? '15803d' : 'b45309' })
            ],
            spacing: { after: 160 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Verdict Rationale: ', bold: true }),
              new TextRun({ text: coverage.verdictRationale, italics: true })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: 'LOGLINE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: coverage.logline,
            spacing: { after: 240 }
          }),
          new Paragraph({
            text: 'SYNOPSIS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: coverage.synopsis,
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: 'CRAFT & VIABILITY RATINGS (0 - 100)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun(`• Premise & Hook Originality: ${coverage.craftScores.premiseOriginality}/100\n`),
              new TextRun(`• Structural Cohesion: ${coverage.craftScores.structuralCohesion}/100\n`),
              new TextRun(`• Character Depth & Agency: ${coverage.craftScores.characterDepthAndAgency}/100\n`),
              new TextRun(`• Dialogue Cadence & Subtext: ${coverage.craftScores.dialogueCadenceAndSubtext}/100\n`),
              new TextRun(`• Narrative Velocity: ${coverage.craftScores.narrativeVelocity}/100\n`),
              new TextRun(`• Commercial Viability: ${coverage.craftScores.commercialViability}/100\n`),
              new TextRun({ text: `• OVERALL EVALUATION: ${coverage.craftScores.overallScore}/100`, bold: true })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: 'VOICE SAFEGUARD FINGERPRINT',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Tone Signature: ', bold: true }),
              new TextRun(coverage.voiceSafeguard.signatureTone)
            ],
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Certification: ', bold: true }),
              new TextRun({ text: coverage.voiceSafeguard.safeguardCertification, italics: true })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: 'KEY SCRIPT DOCTOR NOTES',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...coverage.criticalDoctorNotes.map(note => new Paragraph({
            children: [
              new TextRun({ text: '• ', bold: true }),
              new TextRun(note)
            ],
            spacing: { after: 100 }
          })),
          new Paragraph({
            text: 'MARKET COMPARABLES',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 }
          }),
          ...coverage.marketComparables.map(comp => new Paragraph({
            children: [
              new TextRun({ text: '▸ ', bold: true }),
              new TextRun(comp)
            ],
            spacing: { after: 80 }
          }))
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = coverage.metadata.title.replace(/[^a-zA-Z0-9]/g, '_');
  triggerDownload(blob, `${cleanTitle}_Hollywood_Coverage_Report.docx`);
}

/**
 * Exports formatted screenplay as DOCX
 */
export async function exportScreenplayToDocx(title: string, author: string, content: string): Promise<void> {
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: title.toUpperCase(),
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 }
    }),
    new Paragraph({
      text: `Written by ${author}`,
      spacing: { after: 400 }
    })
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      continue;
    }

    const isSlug = /^(INT\.|EXT\.|I\/E)/i.test(trimmed);
    const isCharacter = /^[A-Z0-9\s\.\-\'\(\)\/]{2,30}$/.test(trimmed) && !trimmed.includes(':') && !isSlug;
    const isParenthetical = trimmed.startsWith('(') && trimmed.endsWith(')');

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: trimmed,
            font: 'Courier New',
            size: 24, // 12pt
            bold: isSlug || isCharacter
          })
        ],
        indent: isCharacter ? { left: 4320 } : isParenthetical ? { left: 3600 } : undefined,
        spacing: { after: 80 }
      })
    );
  }

  const doc = new Document({
    sections: [{ children: paragraphs }]
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
  triggerDownload(blob, `${cleanTitle}_Screenplay.docx`);
}

/**
 * Exports Coverage Report as clean JSON
 */
export function exportCoverageToJson(coverage: FullCoverageReport): void {
  const jsonStr = JSON.stringify(coverage, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const cleanTitle = coverage.metadata.title.replace(/[^a-zA-Z0-9]/g, '_');
  triggerDownload(blob, `${cleanTitle}_Coverage_Report.json`);
}

/**
 * Exports raw screenplay as .txt / .fountain
 */
export function exportScreenplayText(title: string, content: string, ext: 'txt' | 'fountain' = 'fountain'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
  triggerDownload(blob, `${cleanTitle}.${ext}`);
}

/**
 * Triggers instant browser download of the packaged application zip archive
 */
export function downloadProjectZip(): void {
  const a = document.createElement('a');
  a.href = '/api/download-zip';
  a.download = 's2rfilm-screenplay-reviewer.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Triggers instant browser download of the duplicated standalone desktop application
 */
export function downloadStandaloneDesktopZip(platform: 'all' | 'mac' | 'windows' = 'all'): void {
  const filename =
    platform === 'mac'
      ? 's2rfilm-studio-mac.zip'
      : platform === 'windows'
      ? 's2rfilm-studio-windows.zip'
      : 's2rfilm-studio-desktop.zip';

  const a = document.createElement('a');
  a.href = `/api/download-desktop/${platform}`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
