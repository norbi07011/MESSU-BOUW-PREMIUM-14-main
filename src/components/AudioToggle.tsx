import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { useAudio } from '@/contexts/AudioContext';

export function AudioToggle() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <button
      onClick={toggleMute}
      className="p-2 rounded-lg bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-sky-200 dark:border-blue-500/30 hover:bg-sky-50 dark:hover:bg-black/70 transition-all duration-200"
      title={isMuted ? 'Włącz dźwięk' : 'Wycisz dźwięk'}
    >
      {isMuted ? (
        <SpeakerSlash size={20} className="text-black dark:text-black" />
      ) : (
        <SpeakerHigh size={20} className="text-black dark:text-black" />
      )}
    </button>
  );
}
