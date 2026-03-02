import { useEffect, useMemo, useState } from 'react';

const defaultGenre = 'West Coast hip-hop / chant hook rap';

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [templates, setTemplates] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    genre_primary: defaultGenre,
    song1: 'None',
    song2: 'None',
    artist: '',
    title: '',
    reference_lyrics: '',
    new_song_topic: '',
    tempo_hint: 'medium'
  });

  useEffect(() => {
    window.api.getSettings().then((s) => setHasApiKey(s.hasApiKey));
    window.api.loadTemplates().then(setTemplates);
  }, []);

  const payload = useMemo(() => ({
    reference_lyrics: form.reference_lyrics,
    reference_song_metadata: { artist: form.artist, title: form.title },
    new_song_topic: form.new_song_topic,
    suno_settings: {
      genre_primary: form.genre_primary,
      tempo_hint: form.tempo_hint,
      explicitness: 'clean'
    }
  }), [form]);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const onGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await window.api.generateLyrics(payload);
      setResult(res.text);
    } catch (e: any) {
      setError(e.message || 'failed');
    } finally {
      setLoading(false);
    }
  };

  const extract = (header: string, next?: string) => {
    if (!result) return '';
    const start = result.indexOf(header);
    if (start < 0) return '';
    const from = start + header.length;
    const end = next ? result.indexOf(next, from) : result.length;
    return result.slice(from, end > -1 ? end : result.length).trim();
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex">
      <div className="w-1/2 border-r border-slate-700" />
      <div className="w-1/2 p-4 overflow-y-auto space-y-3">
        <button className="btn" onClick={() => setShowModal(true)}>API Key 설정</button>
        {!hasApiKey && <p className="text-amber-300">API 키가 없어 Generate 비활성화 상태입니다.</p>}

        <select className="input" value={form.genre_primary} onChange={(e) => update('genre_primary', e.target.value)}>
          <option>{defaultGenre}</option>
          <option>Drill</option>
          <option>R&B</option>
        </select>
        <select className="input" value={form.song1} onChange={(e) => update('song1', e.target.value)}><option>None</option><option>Song A</option></select>
        <select className="input" value={form.song2} onChange={(e) => update('song2', e.target.value)}><option>None</option><option>Song B</option></select>
        <input className="input" placeholder="원곡 아티스트" value={form.artist} onChange={(e) => update('artist', e.target.value)} />
        <input className="input" placeholder="원곡 제목" value={form.title} onChange={(e) => update('title', e.target.value)} />
        <textarea className="input h-32" placeholder="원곡 가사" value={form.reference_lyrics} onChange={(e) => update('reference_lyrics', e.target.value)} />
        <textarea className="input h-32" placeholder="새 주제/시놉시스" value={form.new_song_topic} onChange={(e) => update('new_song_topic', e.target.value)} />

        <div className="flex gap-2">
          <button className="btn" disabled={!hasApiKey || loading} onClick={onGenerate}>Generate</button>
          <button className="btn" onClick={() => { setForm({ ...form, artist:'', title:'', reference_lyrics:'', new_song_topic:'' }); setResult(''); }}>Reset</button>
        </div>

        <div className="panel">
          <h3>복붙용 템플릿</h3>
          <textarea className="input h-24" value={templateText} onChange={(e) => setTemplateText(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button className="btn" onClick={async () => { await window.api.saveTemplate('default', templateText); setTemplates(await window.api.loadTemplates()); }}>Save Template</button>
            <button className="btn" onClick={() => setTemplateText(templates.default || '')}>Load Template</button>
            <button className="btn" onClick={() => window.api.copyToClipboard(templateText)}>Copy Template</button>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <pre className="panel font-mono whitespace-pre-wrap">{result}</pre>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => window.api.copyToClipboard(result)}>Copy All</button>
          <button className="btn" onClick={() => window.api.copyToClipboard(extract('🎵 제목', '🎼 가사'))}>Copy Title</button>
          <button className="btn" onClick={() => window.api.copyToClipboard(extract('🎼 가사', '🎛 프롬프트'))}>Copy Lyrics</button>
          <button className="btn" onClick={() => window.api.copyToClipboard(extract('🎛 프롬프트', 'EXCLUDE'))}>Copy Prompt</button>
          <button className="btn" onClick={() => window.api.copyToClipboard(extract('EXCLUDE'))}>Copy Exclude</button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-4 rounded w-[420px] space-y-2">
            <h2>API Key 설정</h2>
            <input className="input" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="sk-..." />
            <div className="flex gap-2 justify-end">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn" onClick={async () => { await window.api.setApiKey(apiKeyInput); setHasApiKey(true); setShowModal(false); setApiKeyInput(''); }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
