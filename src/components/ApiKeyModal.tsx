import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (key: string) => Promise<void>;
};

export default function ApiKeyModal({ open, onClose, onSave }: Props) {
  const [apiKey, setApiKey] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold mb-3">API Key 설정</h2>
        <input
          type="password"
          placeholder="sk-..."
          className="w-full"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="bg-neutral-700" onClick={onClose}>
            취소
          </button>
          <button
            className="bg-blue-600"
            onClick={async () => {
              await onSave(apiKey);
              setApiKey('');
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
