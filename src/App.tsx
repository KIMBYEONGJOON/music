import { useEffect, useMemo, useState } from 'react';
import ApiKeyModal from './components/ApiKeyModal';

type GeneratePayload = {
  reference_lyrics: string;
  reference_song_metadata: { artist: string; title: string };
  new_song_topic: string;
  suno_settings: {
    genre_primary: string;
    tempo_hint: string;
    explicitness: 'clean';
  };
};

const GENRE_DEFAULT = 'West Coast hip-hop / chant hook rap';
const SONG_OPTIONS = ['None', 'Option A', 'Option B', 'Option C'];

function extractBlock(text: string, header: string, nextHeaders: string[]) {
  const start = text.indexOf(header);
  if (start === -1) return '';
  const from = start + header.length;
  const next = nextHeaders
    .map((h) => text.indexOf(h, from))
    .filter((idx) => idx !== -1)
    .sort((a, b) => a - b)[0];
  return text.slice(from, next === undefined ? text.length : next).trim();
}

export default function App() {
  const [showApiModal, setShowApiModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [sunoUrl, setSunoUrl] = useState('https://suno.com');

  const [genre, setGenre] = useState(GENRE_DEFAULT);
  const [song1, setSong1] = useState(SONG_OPTIONS[0]);
  const [song2, setSong2] = useState(SONG_OPTIONS[0]);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [referenceLyrics, setReferenceLyrics] = useState('');
  const [topic, setTopic] = useState('');
  const [tempoHint, setTempoHint] = useState('');
  const [template, setTemplate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    window.appApi.getSettings().then((res) => {
      setHasApiKey(res.hasApiKey);
      setSunoUrl(res.sunoUrl);
    });
  }, []);

  const payload: GeneratePayload = useMemo(
    () => ({
      reference_lyrics: referenceLyrics,
      reference_song_metadata: { artist, title },
      new_song_topic: topic,
      suno_settings: {
        genre_primary: genre,
        tempo_hint: tempoHint,
        explicitness: 'clean',
      },
    }),
    [artist, genre, referenceLyrics, tempoHint, title, topic],
  );

  const doGenerate = async () => {
    setLoading(true);
    setError('');
    const res = await window.appApi.generate(payload);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || '요청 실패');
      return;
    }
    setResult(res.text);
  };

  const reset = () => {
    setGenre(GENRE_DEFAULT);
    setSong1(SONG_OPTIONS[0]);
    setSong2(SONG_OPTIONS[0]);
    setArtist('');
    setTitle('');
    setReferenceLyrics('');
    setTopic('');
    setTempoHint('');
    setTemplate('');
    setResult('');
    setError('');
  };

  const copyText = async (text: string) => navigator.clipboard.writeText(text);
  const prompt = extractBlock(result, '🎛 프롬프트', ['EXCLUDE']);
  const songTitle = extractBlock(result, '🎵 제목', ['🎼 가사']);
  const lyrics = extractBlock(result, '🎼 가사', ['🎛 프롬프트']);
  const exclude = extractBlock(result, 'EXCLUDE', []);

  return (
    <div className="h-screen w-screen grid grid-cols-1 md:grid-cols-2">
      <div className="border-r border-neutral-800">
        <webview title="suno" src={sunoUrl} className="w-full h-full" allowpopups="false" />
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">STRUCTURE_ONLY_REFERENCE_LYRIC_SYSTEM</h1>
          <button className="bg-indigo-600" onClick={() => setShowApiModal(true)}>
            API Key 설정
          </button>
        </div>

        {!hasApiKey && <div className="text-amber-300">API 키를 먼저 설정하세요. (Generate 비활성화)</div>}

        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm">장르 (genre_primary)</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option>{GENRE_DEFAULT}</option>
            <option>Trap</option>
            <option>R&B</option>
          </select>

          <label className="text-sm">기존제공노래</label>
          <select value={song1} onChange={(e) => setSong1(e.target.value)}>
            {SONG_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>

          <label className="text-sm">기존제공노래2</label>
          <select value={song2} onChange={(e) => setSong2(e.target.value)}>
            {SONG_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>

          <label className="text-sm">원곡 아티스트</label>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} />

          <label className="text-sm">원곡 제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className="text-sm">Tempo Hint</label>
          <input value={tempoHint} onChange={(e) => setTempoHint(e.target.value)} />

          <label className="text-sm">원곡 가사 (reference_lyrics)</label>
          <textarea className="min-h-28" value={referenceLyrics} onChange={(e) => setReferenceLyrics(e.target.value)} />

          <label className="text-sm">새 주제/시놉시스 (new_song_topic)</label>
          <textarea className="min-h-28" value={topic} onChange={(e) => setTopic(e.target.value)} />

          <div className="flex gap-2 mt-1">
            <button className="bg-emerald-600 disabled:bg-neutral-700" onClick={doGenerate} disabled={!hasApiKey || loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
            <button className="bg-neutral-700" onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        <div className="rounded border border-neutral-700 p-3 space-y-2">
          <div className="font-medium">복붙용 템플릿</div>
          <textarea className="w-full min-h-24" value={template} onChange={(e) => setTemplate(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-blue-600" onClick={() => window.appApi.saveTemplate(template)}>
              Save Template
            </button>
            <button
              className="bg-blue-600"
              onClick={async () => {
                const res = await window.appApi.loadTemplate();
                setTemplate(res.template || '');
              }}
            >
              Load Template
            </button>
            <button className="bg-blue-600" onClick={() => copyText(template)}>
              Copy Template
            </button>
          </div>
        </div>

        {error && <div className="text-red-400 whitespace-pre-wrap">{error}</div>}

        <div className="rounded border border-neutral-700 p-3 space-y-2">
          <div className="font-medium">결과</div>
          <pre className="whitespace-pre-wrap bg-neutral-950 border border-neutral-800 p-3 rounded text-xs font-mono min-h-40">
            {result}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button className="bg-purple-700" onClick={() => copyText(result)}>
              Copy All
            </button>
            <button className="bg-purple-700" onClick={() => copyText(songTitle)}>
              Copy Title
            </button>
            <button className="bg-purple-700" onClick={() => copyText(lyrics)}>
              Copy Lyrics
            </button>
            <button className="bg-purple-700" onClick={() => copyText(prompt)}>
              Copy Prompt
            </button>
            <button className="bg-purple-700" onClick={() => copyText(exclude)}>
              Copy Exclude
            </button>
          </div>
        </div>
      </div>

      <ApiKeyModal
        open={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={async (key) => {
          await window.appApi.saveApiKey(key);
          setHasApiKey(Boolean(key.trim()));
          setShowApiModal(false);
        }}
      />
    </div>
  );
}
