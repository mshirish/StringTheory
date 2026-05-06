// AvatarPicker — two-tab picker: 12 preset DiceBear "adventurer" avatars OR
// a local file upload (PUT to S3 via presigned URL). The selected avatar
// gets a purple ring + checkmark overlay.

import { useRef, useState } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const PRESET_SEEDS = [
  'guitar-hero',  'fret-master',  'chord-wizard',  'string-sage',
  'riff-lord',    'pick-knight',  'note-ninja',    'scale-samurai',
  'tune-titan',   'beat-baron',   'jam-jedi',      'lick-legend',
];

const dicebear = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1e1e3a`;

interface Props {
  selectedUrl: string;
  onSelect: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  uploading: boolean;
  error?: string;
}

type Tab = 'preset' | 'upload';

export const AvatarPicker = ({ selectedUrl, onSelect, onUpload, uploading, error }: Props) => {
  const [tab, setTab]               = useState<Tab>('preset');
  const [preview, setPreview]       = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isPresetSelected = PRESET_SEEDS.some((s) => selectedUrl === dicebear(s));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const url = await onUpload(file);
      onSelect(url);
    } catch {
      setPreview(null);
      setUploadError('Upload failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary border border-border rounded-xl p-1 mb-5 w-fit">
        {(['preset', 'upload'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            {t === 'preset' ? 'Choose avatar' : 'Upload photo'}
          </button>
        ))}
      </div>

      {tab === 'preset' ? (
        /* ── Preset grid ─── */
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {PRESET_SEEDS.map((seed) => {
            const url        = dicebear(seed);
            const isSelected = selectedUrl === url;
            return (
              <button
                key={seed}
                type="button"
                onClick={() => onSelect(url)}
                title={seed}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-150
                  ${isSelected
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-border hover:border-primary/50 hover:scale-102'}`}
              >
                <img
                  src={url}
                  alt={seed}
                  className="w-full h-full object-cover bg-bg-elevated"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-end justify-end p-1">
                    <div className="bg-primary rounded-full w-5 h-5 flex items-center justify-center shadow">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Upload tab ─── */
        <div className="flex flex-col items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`relative w-36 h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center
              transition-colors cursor-pointer overflow-hidden
              ${selectedUrl && !isPresetSelected
                ? 'border-primary'
                : 'border-border hover:border-primary/60'}`}
          >
            {uploading ? (
              <LoadingSpinner size="md" />
            ) : preview || (selectedUrl && !isPresetSelected) ? (
              <img
                src={preview ?? selectedUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <span className="text-3xl mb-1">📷</span>
                <span className="text-xs text-gray-500">Click to upload</span>
              </>
            )}
            {selectedUrl && !isPresetSelected && !uploading && (
              <div className="absolute bottom-1.5 right-1.5 bg-primary rounded-full w-5 h-5 flex items-center justify-center shadow">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          <p className="text-xs text-gray-500">JPG, PNG, WEBP — max 5 MB</p>

          {uploadError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <span>⚠</span> {uploadError}
            </p>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5"><span>⚠</span> {error}</p>}
    </div>
  );
};
