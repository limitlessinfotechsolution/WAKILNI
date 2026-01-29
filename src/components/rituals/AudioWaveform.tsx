import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  isRecording: boolean;
  audioUrl?: string | null;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  duration?: number;
  className?: string;
}

export function AudioWaveform({
  isRecording,
  audioUrl,
  onStartRecording,
  onStopRecording,
  duration = 0,
  className,
}: AudioWaveformProps) {
  const { isRTL } = useLanguage();
  const [bars, setBars] = useState<number[]>(Array(20).fill(0.2));
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  // Simulate waveform animation when recording
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        setBars(prev => prev.map(() => 0.1 + Math.random() * 0.9));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(Array(20).fill(0.2));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn('rounded-xl border-2 bg-muted/30 p-4', className)}>
      {/* Recording State */}
      <div className="flex items-center gap-4">
        {/* Waveform Display */}
        <div className="flex-1 flex items-center justify-center gap-0.5 h-12">
          {bars.map((height, index) => (
            <div
              key={index}
              className={cn(
                'w-1 rounded-full transition-all duration-75',
                isRecording 
                  ? 'bg-red-500 animate-[waveform_0.5s_ease-in-out_infinite]' 
                  : audioUrl 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
              )}
              style={{ 
                height: `${height * 48}px`,
                animationDelay: `${index * 25}ms`
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Duration */}
          <span className={cn(
            'text-sm font-mono min-w-[50px] text-center',
            isRecording && 'text-red-500 animate-pulse'
          )}>
            {formatDuration(duration)}
          </span>

          {/* Recording Button */}
          {!audioUrl && (
            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'default'}
              className={cn(
                'h-12 w-12 rounded-full transition-all',
                isRecording && 'animate-[recording-pulse_1s_ease-in-out_infinite]'
              )}
              onClick={isRecording ? onStopRecording : onStartRecording}
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Playback Button */}
          {audioUrl && !isRecording && (
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-500 font-medium">
            {isRTL ? 'جاري التسجيل...' : 'Recording...'}
          </span>
        </div>
      )}

      {/* Audio Element (hidden) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
