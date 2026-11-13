import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateHeuristicCoverage, heuristicPolishScene, parseScreenplayText } from './src/server/dramaturgyEngine.ts';
import { AISettings, FullCoverageReport, PolishSceneResult, ScriptMetadata, StoryDoctorMessage } from './src/types/script.ts';

dotenv.config();

const __appDir = process.env.S2R_APP_ROOT || process.cwd();

const app = express();
const PORT = parseInt((process.env.PORT || '3000').trim(), 10);

app.use(express.json({ limit: '50mb' }));

// Helper to call either Gemini or an OpenAI-compatible Web / Local AI model
async function queryAIModel({
  prompt,
  systemInstruction,
  jsonMode,
  aiSettings
}: {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  aiSettings?: AISettings;
}): Promise<{ text: string; source: string } | null> {
  const provider = aiSettings?.provider || 'gemini';

  // 1. Google Gemini (Built-in or user-provided key)
  if (provider === 'gemini') {
    const key = aiSettings?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      return null;
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(jsonMode ? { responseMimeType: 'application/json' } : {})
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out after 18s')), 18000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    return {
      text: response.text || '',
      source: 'gemini-3.8-flash'
    };
  }

  // 2. Local AI Model (Ollama / LM Studio / LocalAI / vLLM) or Custom Web Endpoint
  if (provider === 'local' || provider === 'custom_web') {
    const defaultUrl = provider === 'local' ? 'http://localhost:11434/v1' : 'https://api.openai.com/v1';
    const baseUrl = (aiSettings?.endpointUrl || defaultUrl).replace(/\/+$/, '');
    const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    const model = aiSettings?.modelName || (provider === 'local' ? 'llama3' : 'gpt-4o');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (aiSettings?.apiKey) {
      headers['Authorization'] = `Bearer ${aiSettings.apiKey}`;
    }

    const messages = [
      ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
      { role: 'user', content: prompt }
    ];

    const body: any = {
      model,
      messages,
      temperature: aiSettings?.temperature ?? 0.3
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for local models

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`AI model endpoint error (${resp.status}): ${errorText.slice(0, 300)}`);
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      return {
        text: content,
        source: `${provider}:${model}`
      };
    } catch (err: any) {
      clearTimeout(timeout);
      console.warn(`Error querying ${provider} at ${endpoint}:`, err.message);
      throw err;
    }
  }

  // 3. Pure Heuristic
  return null;
}

// Health status check
app.get('/api/health', (_req: Request, res: Response) => {
  const hasEnvKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    hasApiKey: hasEnvKey,
    engine: hasEnvKey ? 'Gemini 3.8 Flash + S2R Heuristic Engine' : 'S2R Deterministic Heuristic Engine (Offline-First)',
    timestamp: new Date().toISOString()
  });
});

// Download Project Zip Archive Endpoint
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipCandidates = [
    path.join(__appDir, 'public', 's2rfilm-screenplay-reviewer.zip'),
    path.join(__appDir, 's2rfilm-screenplay-reviewer.zip')
  ];

  for (const zipPath of zipCandidates) {
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="s2rfilm-screenplay-reviewer.zip"');
      return res.sendFile(zipPath);
    }
  }

  res.status(404).json({ error: 'Zip archive not found. Run npm run package to generate it.' });
});

// Download Duplicated Standalone Desktop App Endpoint (all | mac | windows)
app.get('/api/download-desktop/:platform', (req: Request, res: Response) => {
  const platform = req.params.platform;
  const map: Record<string, string> = {
    all: 's2rfilm-studio-desktop.zip',
    mac: 's2rfilm-studio-mac.zip',
    windows: 's2rfilm-studio-windows.zip'
  };

  const filename = map[platform];
  if (!filename) {
    res.status(400).json({ error: 'Invalid platform. Use all, mac, or windows.' });
    return;
  }

  const zipPath = path.join(__appDir, 'public', filename);
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.sendFile(zipPath);
  }

  res.status(404).json({ error: `${filename} not found.` });
});

// Test Connection Endpoint for Settings
app.post('/api/test-connection', async (req: Request, res: Response) => {
  try {
    const { aiSettings } = req.body as { aiSettings: AISettings };
    const startTime = Date.now();

    if (aiSettings?.provider === 'heuristic') {
      res.json({
        ok: true,
        source: 'heuristic-engine',
        latencyMs: 1,
        message: 'Deterministic Heuristic Dramaturgy Engine is active (100% offline & air-gapped).'
      });
      return;
    }

    const result = await queryAIModel({
      prompt: 'Respond with exactly: {"connection":"successful","status":"online"}',
      systemInstruction: 'You are a test probe. Return only the requested JSON.',
      jsonMode: true,
      aiSettings
    });

    const latency = Date.now() - startTime;

    if (result && result.text) {
      res.json({
        ok: true,
        source: result.source,
        latencyMs: latency,
        message: `Successfully connected to ${result.source} in ${latency}ms.`
      });
    } else {
      res.json({
        ok: false,
        message: 'No response received. Please check endpoint URL, model name, or API key.'
      });
    }
  } catch (err: any) {
    res.status(400).json({
      ok: false,
      message: err.message || 'Connection failed.'
    });
  }
});

// Full Screenplay Analysis & Hollywood Coverage Endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { metadata, content, aiSettings } = req.body as {
      metadata: ScriptMetadata;
      content: string;
      aiSettings?: AISettings;
    };

    if (!content || !metadata) {
      res.status(400).json({ error: 'Screenplay content and metadata are required.' });
      return;
    }

    // Always compute deterministic metrics first for absolute structural and metric accuracy
    const fallbackCoverage = generateHeuristicCoverage(metadata, content);

    // Prompt for qualitative Hollywood analysis
    const prompt = `Analyze this screenplay draft under the S2RFilm Strict Voice-Preservation Mandate:
"Never rewrite the author's story into generic Hollywood tropes. Fiercely protect and elevate the writer's authentic voice, idiosyncratic cadence, and thematic intent while surgically tightening structure, narrative velocity, and character arcs."

Screenplay Title: "${metadata.title}"
Author: "${metadata.author}"
Genre: "${metadata.genre}"
Format: "${metadata.targetFormat}"
Estimated Pages: ${metadata.estimatedPages}
Author Statement: "${metadata.authorStatement || 'N/A'}"

SCRIPT TEXT EXCERPT (first 4,500 words):
"""
${content.slice(0, 22000)}
"""

Provide a rigorous Hollywood Development Executive Script Coverage report in pure JSON format:
{
  "verdict": "RECOMMEND" | "CONSIDER WITH RESERVATIONS" | "CONSIDER" | "PASS",
  "verdictRationale": "1-2 deep paragraphs analyzing why this script deserves this verdict",
  "logline": "1-sentence high-concept commercial logline with protagonist, inciting spark, stakes, and obstacle",
  "synopsis": "Concise 3-act narrative summary capturing the story arc",
  "craftScores": {
    "premiseOriginality": 88,
    "structuralCohesion": 85,
    "characterDepthAndAgency": 90,
    "dialogueCadenceAndSubtext": 92,
    "narrativeVelocity": 87,
    "commercialViability": 84,
    "overallScore": 88
  },
  "voiceSafeguard": {
    "signatureTone": "Precise description of the author's voice signature",
    "tonalPalette": ["tone 1", "tone 2", "tone 3", "tone 4"],
    "stylisticStrengths": ["strength 1", "strength 2", "strength 3"],
    "preservedQuirks": ["quirk 1", "quirk 2"],
    "clichéTrapsAvoided": ["trope 1 avoided", "trope 2 avoided"],
    "safeguardCertification": "Voice safeguard certificate stating how authorial voice was preserved"
  },
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "criticalDoctorNotes": ["actionable doctor note 1", "actionable doctor note 2", "actionable doctor note 3"],
  "marketComparables": ["FILM A meets FILM B", "Comparable 2", "Comparable 3"]
}`;

    try {
      const aiResponse = await queryAIModel({
        prompt,
        systemInstruction: "You are an elite Hollywood script doctor and development executive with 20 years experience at A24, Searchlight, and Focus Features. Analyze with surgical honesty and dramaturgical depth while fiercely respecting the writer's voice.",
        jsonMode: true,
        aiSettings
      });

      if (aiResponse && aiResponse.text) {
        // Strip markdown backticks if returned
        const cleanJson = aiResponse.text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
        const aiData = JSON.parse(cleanJson);

        const mergedReport: FullCoverageReport = {
          ...fallbackCoverage,
          verdict: aiData.verdict || fallbackCoverage.verdict,
          verdictRationale: aiData.verdictRationale || fallbackCoverage.verdictRationale,
          logline: aiData.logline || fallbackCoverage.logline,
          synopsis: aiData.synopsis || fallbackCoverage.synopsis,
          craftScores: {
            ...fallbackCoverage.craftScores,
            ...(aiData.craftScores || {})
          },
          voiceSafeguard: {
            ...fallbackCoverage.voiceSafeguard,
            ...(aiData.voiceSafeguard || {})
          },
          keyStrengths: aiData.keyStrengths || fallbackCoverage.keyStrengths,
          criticalDoctorNotes: aiData.criticalDoctorNotes || fallbackCoverage.criticalDoctorNotes,
          marketComparables: aiData.marketComparables || fallbackCoverage.marketComparables
        };

        res.json({ coverage: mergedReport, source: aiResponse.source });
        return;
      }
    } catch (modelError: any) {
      console.warn('AI analysis call failed, falling back to heuristic engine:', modelError.message);
    }

    // Deterministic Heuristic Fallback
    res.json({ coverage: fallbackCoverage, source: 'heuristic-engine' });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze script.' });
  }
});

// Scene Polishing Endpoint
app.post('/api/polish-scene', async (req: Request, res: Response) => {
  try {
    const { sceneText, instructions, metadata, aiSettings } = req.body as {
      sceneText: string;
      instructions?: string;
      metadata?: ScriptMetadata;
      aiSettings?: AISettings;
    };

    if (!sceneText) {
      res.status(400).json({ error: 'Scene text is required.' });
      return;
    }

    const dummyScene = {
      id: 'active-scene',
      sceneNumber: 1,
      slugline: 'ACTIVE SCENE',
      location: 'SCENE',
      timeOfDay: 'DAY',
      isInterior: true,
      actionText: '',
      dialogueBlocks: [],
      rawText: sceneText,
      wordCount: sceneText.split(/\s+/).length
    };

    const prompt = `You are an elite Hollywood script doctor operating under the S2RFilm Strict Voice-Preservation Mandate:
"Never rewrite the author's story into generic Hollywood tropes. Fiercely protect and elevate the writer's authentic voice, idiosyncratic cadence, and thematic intent while surgically tightening structure, narrative velocity, and character arcs."

Writer's Title: "${metadata?.title || 'Screenplay'}"
Genre: "${metadata?.genre || 'Drama'}"
Writer's Specific Direction: "${instructions || 'Tighten dialogue cadence, eliminate on-the-nose exposition, and sharpen whitespace balance without altering character voice.'}"

ORIGINAL SCENE:
"""
${sceneText}
"""

Provide a surgical polish in pure JSON:
{
  "polishedScene": "Full polished scene formatted in industry standard Courier text",
  "summaryOfImprovements": "2-3 sentences explaining what was tightened",
  "voicePreservationGuarantees": [
    "Guarantee 1 about preserved diction/quirk",
    "Guarantee 2 about retained character syntax"
  ],
  "rationales": [
    {
      "original": "Original line or fragment",
      "revised": "Revised line",
      "explanation": "Why this change preserves voice while accelerating rhythm and subtext"
    }
  ]
}`;

    try {
      const aiResponse = await queryAIModel({
        prompt,
        systemInstruction: "You are a master dramaturge and dialogue polisher. You do not dumb down or sanitize scripts. You make them sharper, punchier, and more subtextual while strictly honoring the writer's voice.",
        jsonMode: true,
        aiSettings
      });

      if (aiResponse && aiResponse.text) {
        const cleanJson = aiResponse.text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
        const result = JSON.parse(cleanJson);
        res.json({
          result: {
            sceneId: 'active-scene',
            originalScene: sceneText,
            polishedScene: result.polishedScene || sceneText,
            summaryOfImprovements: result.summaryOfImprovements || 'Surgically refined scene rhythm and subtext.',
            voicePreservationGuarantees: result.voicePreservationGuarantees || ['Protected authentic diction.'],
            rationales: result.rationales || []
          } as PolishSceneResult,
          source: aiResponse.source
        });
        return;
      }
    } catch (err: any) {
      console.warn('AI polish failed, falling back to heuristic engine:', err.message);
    }

    const fallbackPolish = heuristicPolishScene(dummyScene, instructions);
    res.json({ result: fallbackPolish, source: 'heuristic-engine' });
  } catch (err: any) {
    console.error('Polish error:', err);
    res.status(500).json({ error: err.message || 'Failed to polish scene.' });
  }
});

// Story Doctor Chat Endpoint
app.post('/api/story-doctor', async (req: Request, res: Response) => {
  try {
    const { messages, scriptContext, metadata, aiSettings } = req.body as {
      messages: StoryDoctorMessage[];
      scriptContext: string;
      metadata: ScriptMetadata;
      aiSettings?: AISettings;
    };

    if (!messages || messages.length === 0) {
      res.status(400).json({ error: 'Messages are required.' });
      return;
    }

    const lastMessage = messages[messages.length - 1].content;
    const historyContext = messages.slice(-6).map(m => `${m.role === 'user' ? 'Screenwriter' : 'Story Doctor'}: ${m.content}`).join('\n\n');

    const prompt = `You are the resident Story Doctor at S2RFilm Studio, advising the screenwriter on their project "${metadata.title}" (${metadata.genre}, ${metadata.targetFormat}).

STRICT MANDATE:
- Protect the writer's authentic voice, creative intent, and idiosyncratic tone.
- Never suggest generic Hollywood clichés or formulas.
- Ground your advice in high-level dramaturgy: character want vs need, subtextual ping-pong, dramatic irony, agency, and tactile cinematic imagery.

SCREENPLAY CONTEXT EXCERPT:
"""
${scriptContext.slice(0, 10000)}
"""

CONVERSATION HISTORY:
${historyContext}

USER'S LATEST QUESTION:
"${lastMessage}"

Respond thoughtfully as a respectful, razor-sharp veteran dramaturg and script doctor. Give actionable, non-destructive ideas that respect the writer's original voice.`;

    try {
      const aiResponse = await queryAIModel({
        prompt,
        systemInstruction: "You are a warm, erudite Hollywood script doctor who speaks directly to writers about craft, subtext, tension, and character agency without fluff or platitudes.",
        jsonMode: false,
        aiSettings
      });

      if (aiResponse && aiResponse.text) {
        res.json({ reply: aiResponse.text, source: aiResponse.source });
        return;
      }
    } catch (err: any) {
      console.warn('AI story doctor error, using heuristic advice:', err.message);
    }

    // Heuristic advice fallback
    res.json({
      reply: `From a dramaturgical perspective on "${metadata.title}", consider testing your protagonist's agency here: are they making a proactive choice with irrevocable consequences, or reacting to external pressure? By stripping away expository dialogue and letting the conflict play out through subtext and physical behavior, you can elevate tension while protecting your authentic voice.`,
      source: 'heuristic-engine'
    });
  } catch (err: any) {
    console.error('Story doctor error:', err);
    res.status(500).json({ error: err.message || 'Failed to consult story doctor.' });
  }
});

// Setup Vite middleware in dev or static files in production
export async function startStandaloneServer(
  customPort?: number,
  host: string = '127.0.0.1'
): Promise<{ server: import('http').Server; port: number }> {
  const isProd = process.env.NODE_ENV === 'production' || process.env.S2R_STANDALONE === '1';

  if (isProd) {
    const distDir = process.env.S2R_DIST_DIR || path.join(__appDir, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const listenPort = typeof customPort === 'number' ? customPort : PORT;

  return new Promise((resolve, reject) => {
    const server = app.listen(listenPort, host, () => {
      const addr = server.address();
      const activePort = typeof addr === 'object' && addr ? addr.port : listenPort;
      console.log(`🎬 S2RFilm Studio Desktop server listening on http://${host}:${activePort}`);
      resolve({ server, port: activePort });
    });
    server.on('error', reject);
  });
}

// Auto-start when executed directly via CLI (tsx server.ts / node server.cjs)
if (process.env.S2R_STANDALONE !== '1') {
  startStandaloneServer(PORT, '127.0.0.1').catch(err => {
    console.error('Failed to start server:', err);
  });
}
