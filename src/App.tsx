import { useEffect, useMemo, useState } from 'react';

type FormState = {
  genre_primary: string;
  existing_song_1: string;
  existing_song_2: string;
  artist: string;
  title: string;
  reference_lyrics: string;
  new_song_topic: string;
  tempo_hint: string;
};

const DEFAULT_FORM: FormState = {
  genre_primary: 'West Coast hip-hop / chant hook rap',
  existing_song_1: '',
  existing_song_2: '',
  artist: '',
  title: '',
  reference_lyrics: '',
  new_song_topic: '',
  tempo_hint: ''
};

const GENRE_OPTIONS = [
  'West Coast hip-hop / chant hook rap',
  'Trap',
  'R&B / Soul',
  'K-pop',
  'Pop'
];

const SONG_OPTIONS = ['Option A', 'Option B', 'Option C'];

const extractByHeader = (text: string, header: string): string => {
  const idx = text.indexOf(header);
  if (idx === -1) return '';
  const rest = text.slice(idx + header.length);
  const next = rest.search(/\n(?:🎵 제목|🎼 가사|🎛 프롬프트|EXCLUDE)/);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
};

export default function App() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [template, setTemplate] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('gpt-4.1-mini');
  const [sunoUrl, setSunoUrl] = useState('https://suno.com');
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    window.electronAPI.getSettings().then((settings) => {
      setApiReady(Boolean(settings.apiKey));
      setApiKeyInput(settings.apiKey || '');
      setModelInput(settings.model || 'gpt-4.1-mini');
      setSunoUrl(settings.sunoUrl || 'https://suno.com');
    });
  }, []);

  const payload = useMemo(
    () => ({
      reference_lyrics: form.reference_lyrics,
      reference_song_metadata: { artist: form.artist, title: form.title },
      new_song_topic: form.new_song_topic,
      suno_settings: {
        genre_primary: form.genre_primary,
        tempo_hint: form.tempo_hint,
        explicitness: 'clean' as const
      }
    }),
    [form]
  );

  const generate = async () => {
    setLoading(true);
    setError('');
    const res = await window.electronAPI.generate(payload);
    setLoading(false);
    if (!res.ok || !res.text) {
      setError(res.error || '알 수 없는 오류');
      return;
    }
    setResult(res.text);
  };

  const reset = () => {
    setForm(DEFAULT_FORM);
    setResult('');
    setError('');
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2">
      <div className="border-r border-slate-300 h-full">
        <webview src={sunoUrl} className="w-full h-full" allowpopups="false" />
      </div>
      <div className="h-full overflow-auto p-4 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">STRUCTURE ONLY LYRIC TOOL</h1>
          <button className="px-3 py-1 border rounded" onClick={() => setShowApiModal(true)}>
            API Key 설정
          </button>
        </div>

        {!apiReady && <div className="text-red-600 text-sm">API 키를 먼저 설정하세요.</div>}

        <select className="w-full p-2 border rounded" value={form.genre_primary} onChange={(e) => setForm({ ...form, genre_primary: e.target.value })}>
          {GENRE_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <select className="w-full p-2 border rounded" value={form.existing_song_1} onChange={(e) => setForm({ ...form, existing_song_1: e.target.value })}>
          <option value="">기존제공노래</option>
          {SONG_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select className="w-full p-2 border rounded" value={form.existing_song_2} onChange={(e) => setForm({ ...form, existing_song_2: e.target.value })}>
          <option value="">기존제공노래2</option>
          {SONG_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input className="p-2 border rounded" placeholder="원곡 아티스트" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
          <input className="p-2 border rounded" placeholder="원곡 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <textarea className="w-full p-2 border rounded h-28" placeholder="원곡 가사(reference_lyrics)" value={form.reference_lyrics} onChange={(e) => setForm({ ...form, reference_lyrics: e.target.value })} />
        <textarea className="w-full p-2 border rounded h-28" placeholder="새 주제/시놉시스(new_song_topic)" value={form.new_song_topic} onChange={(e) => setForm({ ...form, new_song_topic: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="tempo_hint" value={form.tempo_hint} onChange={(e) => setForm({ ...form, tempo_hint: e.target.value })} />

        <div className="flex gap-2">
          <button disabled={!apiReady || loading} className="px-3 py-2 rounded bg-blue-600 text-white disabled:bg-slate-400" onClick={generate}>Generate</button>
          <button className="px-3 py-2 rounded border" onClick={reset}>Reset</button>
        </div>

        <div className="border rounded p-2 bg-white space-y-2">
          <h2 className="font-semibold">복붙용 템플릿</h2>
          <textarea className="w-full h-24 border rounded p-2" value={template} onChange={(e) => setTemplate(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.saveTemplate(template)}>Save Template</button>
            <button className="px-2 py-1 border rounded" onClick={async () => setTemplate(await window.electronAPI.loadTemplate())}>Load Template</button>
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.copyText(template)}>Copy Template</button>
          </div>
        </div>

        {loading && <div className="text-sm text-slate-600">생성 중...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="border rounded p-2 bg-white">
          <h2 className="font-semibold mb-2">결과</h2>
          <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-100 p-2 rounded min-h-48">{result}</pre>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.copyText(result)}>Copy All</button>
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.copyText(extractByHeader(result, '🎵 제목'))}>Copy Title</button>
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.copyText(extractByHeader(result, '🎼 가사'))}>Copy Lyrics</button>
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.copyText(extractByHeader(result, '🎛 프롬프트'))}>Copy Prompt</button>
            <button className="px-2 py-1 border rounded" onClick={() => window.electronAPI.copyText(extractByHeader(result, 'EXCLUDE'))}>Copy Exclude</button>
          </div>
        </div>
      </div>

      {showApiModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[480px] space-y-2">
            <h3 className="font-semibold">API 설정</h3>
            <input className="w-full p-2 border rounded" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="OPENAI_API_KEY" />
            <input className="w-full p-2 border rounded" value={modelInput} onChange={(e) => setModelInput(e.target.value)} placeholder="OPENAI_MODEL" />
            <input className="w-full p-2 border rounded" value={sunoUrl} onChange={(e) => setSunoUrl(e.target.value)} placeholder="Suno URL" />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShowApiModal(false)}>취소</button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={async () => {
                  const updated = await window.electronAPI.saveSettings({
                    apiKey: apiKeyInput,
                    model: modelInput,
                    sunoUrl
                  });
                  setApiReady(Boolean(updated.apiKey));
                  setShowApiModal(false);
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
