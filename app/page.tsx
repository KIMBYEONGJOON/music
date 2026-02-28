'use client';

import { Copy, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type ParsedResult = {
  title: string;
  lyrics: string;
  prompt: string;
  exclude: string;
};

const GENRES = ['R&B', '힙합', '팝', '록', '발라드', 'EDM', '재즈'];

const extractSection = (text: string, keys: string[]): string => {
  const markerPattern = '(?:제목|Title|가사|Lyrics|프롬프트|Prompt|EXCLUDE|제외\s*키워드)';

  for (const key of keys) {
    const regex = new RegExp(`(?:^|\\n)\\s*(?:${key})\\s*[:：]\\s*([\\s\\S]*?)(?=\\n\\s*(?:${markerPattern})\\s*[:：]|$)`, 'i');
    const match = text.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return '';
};

const parseResult = (raw: string): ParsedResult => {
  return {
    title: extractSection(raw, ['제목', 'Title']),
    lyrics: extractSection(raw, ['가사', 'Lyrics']),
    prompt: extractSection(raw, ['프롬프트', 'Prompt']),
    exclude: extractSection(raw, ['EXCLUDE', '제외 키워드'])
  };
};

const composeFullResult = (result: ParsedResult): string => {
  return `🎵 제목\n${result.title}\n\n🎼 가사\n${result.lyrics}\n\n🎛 프롬프트\n${result.prompt}\n\nEXCLUDE\n${result.exclude}`;
};

export default function HomePage() {
  const [place1, setPlace1] = useState('한강');
  const [ratio1, setRatio1] = useState(60);
  const [place2, setPlace2] = useState('홍대');
  const [ratio2, setRatio2] = useState(40);
  const [genre, setGenre] = useState('R&B');
  const [topic, setTopic] = useState('공허');
  const [referenceSong, setReferenceSong] = useState('곡 제목: \n가사: ');

  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResult, setRawResult] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const autoPrompt = useMemo(() => {
    return `${place1} ${ratio1}%와 ${place2} ${ratio2}%에서 듣는 플레이리스트를 만들거야. 장르는 ${genre}로 해줘. 대표 주제로는 ${topic} 느낌을 살려줘. 원곡 레퍼런스와 가사는 다음과 같아: ${referenceSong}`;
  }, [place1, ratio1, place2, ratio2, genre, topic, referenceSong]);

  const parsed = useMemo(() => parseResult(rawResult), [rawResult]);

  const showCopied = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
  };

  const copyText = async (value: string, key: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    showCopied(key);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: autoPrompt })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? '생성 중 오류가 발생했습니다.');
      }

      const payload = await response.json();
      setRawResult(payload.result ?? '');
      setStep(2);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background text-gray-100">
      <section className="hidden h-full w-1/2 border-r border-border bg-black lg:block">
        <iframe title="Suno" src="https://suno.com" className="h-full w-full border-none" />
      </section>

      <section className="h-full w-full overflow-y-auto bg-gradient-to-b from-panel to-background p-5 lg:w-1/2">
        {step === 1 ? (
          <div className="mx-auto max-w-3xl space-y-6">
            <header className="rounded-2xl border border-border bg-panelSoft p-5 shadow-xl">
              <p className="mb-2 inline-flex items-center gap-2 text-sm text-indigo-300">
                <Sparkles size={16} /> Step 1. 입력 구성
              </p>
              <h1 className="text-2xl font-semibold">Suno Prompt Builder</h1>
              <p className="mt-2 text-sm text-gray-300">입력값이 바뀌면 자동 생성 프롬프트가 실시간 업데이트됩니다.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 rounded-2xl border border-border bg-panel p-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-gray-300">장소 1</span>
                  <input value={place1} onChange={(e) => setPlace1(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-gray-300">비율 1 (%)</span>
                  <input type="number" value={ratio1} onChange={(e) => setRatio1(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-gray-300">장소 2</span>
                  <input value={place2} onChange={(e) => setPlace2(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-gray-300">비율 2 (%)</span>
                  <input type="number" value={ratio2} onChange={(e) => setRatio2(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-gray-300">장르</span>
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring">
                    {GENRES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-gray-300">대표 주제</span>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-gray-300">기존 제공 노래 제목 및 가사</span>
                  <textarea value={referenceSong} onChange={(e) => setReferenceSong(e.target.value)} rows={5} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none ring-indigo-500 transition focus:ring" />
                </label>
              </div>

              <div className="space-y-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-5">
                <p className="text-sm text-indigo-200">자동 생성 프롬프트 (Read-only)</p>
                <textarea readOnly value={autoPrompt} rows={6} className="w-full rounded-lg border border-indigo-400/50 bg-[#0f1833] p-3 text-sm text-indigo-100" />
              </div>

              {error && <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

              <button type="submit" disabled={isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 p-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLoading ? '생성 중...' : '결과 생성하기'}
              </button>
            </form>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4 pb-6">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-panelSoft px-4 py-2 text-sm text-gray-200 hover:bg-panel">
              <RotateCcw size={16} /> 다시 만들기
            </button>

            {([
              ['🎵 제목 (Title)', parsed.title, 'title'],
              ['🎼 가사 (Lyrics)', parsed.lyrics, 'lyrics'],
              ['🎛 프롬프트 (Prompt)', parsed.prompt, 'prompt'],
              ['EXCLUDE (제외 키워드)', parsed.exclude, 'exclude']
            ] as const).map(([label, value, key]) => (
              <article key={key} className="rounded-2xl border border-border bg-panel p-5 shadow-lg">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-indigo-200">{label}</h2>
                  <button onClick={() => copyText(value, key)} className="inline-flex items-center gap-1 rounded-md border border-border bg-panelSoft px-3 py-1.5 text-xs hover:bg-background">
                    <Copy size={14} /> {copiedKey === key ? '복사 완료' : '복사하기'}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-200">{value || '값이 없습니다. 응답 포맷을 확인해 주세요.'}</pre>
              </article>
            ))}

            <button onClick={() => copyText(composeFullResult(parsed), 'all')} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400">
              {copiedKey === 'all' ? '전체 복사 완료' : '전체 결과 복사'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
