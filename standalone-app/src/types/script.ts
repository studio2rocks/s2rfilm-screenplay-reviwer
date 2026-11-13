export type TargetFormat = 'Feature Film' | 'TV Drama Pilot' | 'TV Comedy Pilot' | 'Limited Series' | 'Short Film';

export type CoverageVerdict = 'RECOMMEND' | 'CONSIDER WITH RESERVATIONS' | 'CONSIDER' | 'PASS';

export interface ScriptMetadata {
  title: string;
  author: string;
  genre: string;
  targetFormat: TargetFormat;
  estimatedPages: number;
  authorStatement?: string;
  logline?: string;
  draftDate?: string;
}

export interface DialogueBlock {
  speaker: string;
  parenthetical?: string;
  text: string;
}

export interface ParsedScene {
  id: string;
  sceneNumber: number;
  slugline: string;
  location: string;
  timeOfDay: string;
  isInterior: boolean;
  actionText: string;
  dialogueBlocks: DialogueBlock[];
  rawText: string;
  wordCount: number;
}

export interface CraftScores {
  premiseOriginality: number; // 0-100
  structuralCohesion: number;
  characterDepthAndAgency: number;
  dialogueCadenceAndSubtext: number;
  narrativeVelocity: number;
  commercialViability: number;
  overallScore: number;
}

export interface CharacterVoiceProfile {
  character: string;
  lineCount: number;
  avgWordsPerLine: number;
  vocabularyRichness: number; // 0-100
  dominantCadence: string;
  distinctivenessScore: number; // 0-100
  sampleDialogue: string;
  voiceNotes: string;
}

export interface DialoguePacingMetrics {
  dialoguePercentage: number;
  actionPercentage: number;
  averageDialogueLengthWords: number;
  subtextDensityScore: number; // 0-100
  overallCadenceProfile: string;
  onTheNoseWarnings: Array<{
    speaker: string;
    line: string;
    reason: string;
    suggestedSubtext: string;
  }>;
  characterVoices: CharacterVoiceProfile[];
}

export interface CharacterArc {
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Deuteragonist' | 'Supporting Catalyst' | 'Foil';
  dramaticWant: string; // Conscious external goal
  emotionalNeed: string; // Unconscious internal growth
  agencyScore: number; // 0-100
  fatalFlaw: string;
  keyTurningPoint: string;
  arcTrajectory: 'Transformational Arc' | 'Tragic Decline' | 'Steadfast / Flat Hero' | 'Disillusionment';
  arcNotes: string;
}

export type PlotHoleSeverity = 'Critical' | 'Moderate' | 'Minor';
export type PlotHoleCategory = 'Logic Seam' | 'Character Knowledge Leap' | 'Timeline Inconsistency' | 'Unearned Payoff' | 'Forgotten Setup';

export interface PlotHoleIssue {
  id: string;
  title: string;
  sceneReference: string;
  severity: PlotHoleSeverity;
  category: PlotHoleCategory;
  description: string;
  impactOnStory: string;
  surgicalFix: string;
}

export interface StoryBeat {
  beatName: string;
  sceneNumber: number;
  description: string;
  status: 'Present & Earned' | 'Underdeveloped' | 'Missing';
  notes: string;
}

export interface StructureAct {
  actName: string;
  pageRange: string;
  intensityLevel: number; // 0-100
  beats: StoryBeat[];
  structuralAssessment: string;
}

export interface TensionPoint {
  index: number;
  label: string;
  sceneNumber: number;
  intensity: number; // 0-100
  tensionPhase: 'Exposition' | 'Inciting Spark' | 'Rising Stakes' | 'Midpoint Climax' | 'Dark Night' | 'Climactic Showdown' | 'Resolution';
  summary: string;
}

export interface VoiceSafeguardReport {
  signatureTone: string;
  tonalPalette: string[];
  stylisticStrengths: string[];
  preservedQuirks: string[];
  clichéTrapsAvoided: string[];
  safeguardCertification: string;
}

export interface FullCoverageReport {
  id: string;
  timestamp: string;
  metadata: ScriptMetadata;
  verdict: CoverageVerdict;
  verdictRationale: string;
  logline: string;
  synopsis: string;
  craftScores: CraftScores;
  voiceSafeguard: VoiceSafeguardReport;
  dialogueMetrics: DialoguePacingMetrics;
  characterArcs: CharacterArc[];
  plotHoles: PlotHoleIssue[];
  structureActs: StructureAct[];
  tensionCurve: TensionPoint[];
  keyStrengths: string[];
  criticalDoctorNotes: string[];
  marketComparables: string[]; // e.g. "SUCCESSION meets CHINATOWN"
}

export interface ScenePolishRationale {
  original: string;
  revised: string;
  explanation: string;
}

export interface PolishSceneResult {
  sceneId: string;
  originalScene: string;
  polishedScene: string;
  summaryOfImprovements: string;
  voicePreservationGuarantees: string[];
  rationales: ScenePolishRationale[];
}

export interface StoryDoctorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type AIProvider = 'gemini' | 'local' | 'custom_web' | 'heuristic';

export interface AISettings {
  provider: AIProvider;
  geminiApiKey?: string;
  endpointUrl?: string; // e.g. http://localhost:11434/v1 or http://127.0.0.1:1234/v1
  modelName?: string;   // e.g. llama3.2, mistral, deepseek-r1
  apiKey?: string;      // User API key for local auth or custom web model
  temperature?: number;
  voicePreservationStrictness?: 'maximum' | 'balanced' | 'aggressive_tightening';
}
