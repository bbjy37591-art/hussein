import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOUD_STATE_FILE = path.join(__dirname, '.cloud-workspace-state.json');

interface CloudWorkspacePayload {
  tasks: unknown[];
  hundredState: {
    habits: unknown[];
    completedDays: number[];
  };
  vpsEndpoint: string;
  updatedAt: string;
  deviceId?: string;
}

const DEFAULT_EMPTY_CLOUD_STATE: CloudWorkspacePayload = {
  tasks: [],
  hundredState: {
    habits: [],
    completedDays: [],
  },
  vpsEndpoint: '',
  updatedAt: new Date().toISOString(),
};

function readCloudState(): CloudWorkspacePayload {
  try {
    if (fs.existsSync(CLOUD_STATE_FILE)) {
      const raw = fs.readFileSync(CLOUD_STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        hundredState: parsed.hundredState ?? { habits: [], completedDays: [] },
        vpsEndpoint: typeof parsed.vpsEndpoint === 'string' ? parsed.vpsEndpoint : '',
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch {
    // Return clean formatted state
  }
  return { ...DEFAULT_EMPTY_CLOUD_STATE };
}

function writeCloudState(next: CloudWorkspacePayload): void {
  try {
    fs.writeFileSync(CLOUD_STATE_FILE, JSON.stringify(next, null, 2), 'utf-8');
  } catch {
    // Ignore write error in read-only fs
  }
}

// Initialize clean formatted state on first run only if file does not exist
if (!fs.existsSync(CLOUD_STATE_FILE)) {
  writeCloudState(DEFAULT_EMPTY_CLOUD_STATE);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  const sseClients = new Set<express.Response>();

  function broadcastCloudState(state: CloudWorkspacePayload) {
    const data = `data: ${JSON.stringify(state)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  // Real-time Server-Sent Events stream for instant multi-device sync
  app.get('/api/cloud-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const current = readCloudState();
    res.write(`data: ${JSON.stringify(current)}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Get current unified cloud workspace state
  app.get('/api/cloud-sync', (_req, res) => {
    const state = readCloudState();
    res.json(state);
  });

  // Update unified cloud workspace state & broadcast to all connected devices immediately
  app.post('/api/cloud-sync', async (req, res) => {
    const current = readCloudState();
    const updated: CloudWorkspacePayload = {
      tasks: Array.isArray(req.body?.tasks) ? req.body.tasks : current.tasks,
      hundredState: req.body?.hundredState ?? current.hundredState,
      vpsEndpoint:
        typeof req.body?.vpsEndpoint === 'string'
          ? req.body.vpsEndpoint
          : current.vpsEndpoint,
      updatedAt: new Date().toISOString(),
      deviceId: req.body?.deviceId,
    };
    writeCloudState(updated);
    broadcastCloudState(updated);

    // If a VPS webhook/endpoint is configured, mirror the state to the VPS asynchronously
    if (updated.vpsEndpoint && updated.vpsEndpoint.startsWith('http')) {
      try {
        await fetch(updated.vpsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app: 'مهام حسين علاء',
            syncedAt: updated.updatedAt,
            tasks: updated.tasks,
            hundredState: updated.hundredState,
          }),
          signal: AbortSignal.timeout(3500),
        });
      } catch {
        // Non-blocking if remote VPS is unreachable
      }
    }

    res.json({ ok: true, state: updated });
  });

  // Wipe / Format all cloud workspace data
  app.delete('/api/cloud-sync', (_req, res) => {
    const wiped: CloudWorkspacePayload = {
      tasks: [],
      hundredState: { habits: [], completedDays: [] },
      vpsEndpoint: readCloudState().vpsEndpoint,
      updatedAt: new Date().toISOString(),
    };
    writeCloudState(wiped);
    broadcastCloudState(wiped);
    res.json({ ok: true, state: wiped });
  });

  // Test/Push to VPS endpoint directly
  app.post('/api/vps-bridge', async (req, res) => {
    const targetUrl = String(req.body?.vpsEndpoint || '').trim();
    const current = readCloudState();
    if (!targetUrl || !targetUrl.startsWith('http')) {
      res.status(400).json({
        ok: false,
        message: 'يرجى إدخال رابط خادم VPS صحيح يبدأ بـ http:// أو https://',
      });
      return;
    }

    const updated = { ...current, vpsEndpoint: targetUrl, updatedAt: new Date().toISOString() };
    writeCloudState(updated);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: 'مهام حسين علاء',
          syncedAt: updated.updatedAt,
          tasks: updated.tasks,
          hundredState: updated.hundredState,
        }),
        signal: AbortSignal.timeout(4000),
      });
      res.json({
        ok: true,
        status: response.status,
        message: `تم ربط ومزامنة البيانات مع خادم VPS بنجاح (الحالة: ${response.status}).`,
      });
    } catch {
      res.json({
        ok: true,
        savedConfig: true,
        message:
          'تم حفظ عنوان خادم VPS في السحابة، وسيتم المزامنة التلقائية معه فور تشغيل خدمة الاستقبال على الخادم.',
      });
    }
  });

  // Serve ready-to-build Android APK & Google Play Store configuration bundle
  app.get('/api/apk-package', (req, res) => {
    const hostUrl =
      process.env.APP_URL ||
      `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
    const bundle = {
      appName: 'مهام حسين علاء',
      packageId: 'app.husseinalaa.tasks.twa',
      versionName: '1.0.0',
      versionCode: 1,
      productionUrl: hostUrl,
      googleCloudProjectId: 'gen-lang-client-0817358831',
      firestoreDatabaseId: 'ai-studio-c4acf6d2-3d04-42d8-995d-10597942c10a',
      twaManifestUrl: `${hostUrl}/twa-manifest.json`,
      webManifestUrl: `${hostUrl}/manifest.webmanifest`,
      assetLinksUrl: `${hostUrl}/.well-known/assetlinks.json`,
      buildCommands: [
        'npm i -g @bubblewrap/cli',
        `bubblewrap init --manifest="${hostUrl}/manifest.webmanifest"`,
        'bubblewrap build',
      ],
      capacitorCommands: [
        'npm install @capacitor/core @capacitor/cli @capacitor/android',
        'npx cap add android',
        'npm run build && npx cap sync android',
        'cd android && ./gradlew assembleRelease bundleRelease',
      ],
    };
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="hussein-alaa-android-apk-bundle.json"'
    );
    res.json(bundle);
  });

  // External Psychology & Quotable API Bridge for Daily Motivational Quote in Main Interface
  app.get('/api/daily-psychology-quote', async (req, res) => {
    const dateStr =
      typeof req.query.date === 'string' && req.query.date.trim()
        ? req.query.date.trim()
        : new Date().toISOString().slice(0, 10);
    const offset = Number(req.query.offset || 0) || 0;

    let externalQuoteEn = '';
    let externalAuthorEn = '';
    let sourceService = 'Quotable & Psychology Daily API';

    // Try Quotable API first, then DummyJSON Quotes API as secondary external provider
    try {
      const quotableRes = await fetch(
        'https://api.quotable.io/quotes/random?tags=wisdom|inspirational|success',
        { signal: AbortSignal.timeout(2500) }
      );
      if (quotableRes.ok) {
        const data = await quotableRes.json();
        const first = Array.isArray(data) ? data[0] : data;
        if (first && typeof first.content === 'string') {
          externalQuoteEn = first.content;
          externalAuthorEn = first.author || 'Quotable Psychology Archive';
          sourceService = 'Quotable External API (api.quotable.io)';
        }
      }
    } catch {
      // Fallback to DummyJSON public quotes API if Quotable is unreachable
    }

    if (!externalQuoteEn) {
      try {
        const dummyRes = await fetch('https://dummyjson.com/quotes/random', {
          signal: AbortSignal.timeout(2500),
        });
        if (dummyRes.ok) {
          const data = await dummyRes.json();
          if (data && typeof data.quote === 'string') {
            externalQuoteEn = data.quote;
            externalAuthorEn = data.author || 'Psychology & Wisdom API';
            sourceService = 'External Quotes API (dummyjson.com/quotes)';
          }
        }
      } catch {
        // Offline / restricted network fallback handled gracefully below
      }
    }

    res.json({
      ok: true,
      dateStr,
      offset,
      externalQuoteEn,
      externalAuthorEn,
      sourceService,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
