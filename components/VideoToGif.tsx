'use client';

import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, Download, Loader2, RotateCcw, Play } from 'lucide-react';

export default function VideoToGif() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [gifSrc, setGifSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setGifSrc(null);
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress: prog }) => {
      setProgress(Math.round(prog * 100));
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/unithread';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const convertToGif = async () => {
    if (!videoSrc) return;

    setIsLoading(true);
    setProgress(0);

    try {
      const ffmpeg = await loadFFmpeg();

      // Fetch video file
      const videoFile = await fetchFile(videoSrc);
      await ffmpeg.writeFile('input.mp4', videoFile);

      // Convert to GIF with options
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif'
      ]);

      // Read the result
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([Uint8Array.from(data as Uint8Array)], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      setGifSrc(url);
    } catch (error) {
      console.error('Error converting video to GIF:', error);
      alert('GIF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!gifSrc) return;
    const link = document.createElement('a');
    link.download = 'converted.gif';
    link.href = gifSrc;
    link.click();
  };

  const handleReset = () => {
    setVideoSrc(null);
    setGifSrc(null);
    setProgress(0);
    setFps(10);
    setWidth(480);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!videoSrc ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
          <Upload className="w-16 h-16 text-zinc-400 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            동영상을 업로드하세요
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            MP4, MOV, AVI 등 동영상 파일을 선택해주세요
          </p>
          <label className="cursor-pointer px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            파일 선택
            <input
              type="file"
              accept="video/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
                <Play className="w-4 h-4" />
                원본 동영상
              </h3>
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                className="w-full rounded-lg"
              />
            </div>

            {gifSrc && (
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  변환된 GIF
                </h3>
                <img src={gifSrc} alt="Converted GIF" className="w-full rounded-lg" />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                프레임 속도 (FPS): {fps}
              </label>
              <input
                type="range"
                min={5}
                max={30}
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                높을수록 부드럽지만 파일 크기가 커집니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                너비 (픽셀): {width}
              </label>
              <input
                type="range"
                min={240}
                max={1080}
                step={60}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                작을수록 파일 크기가 작아집니다
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  GIF 변환 중... {progress}%
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!gifSrc ? (
              <button
                onClick={convertToGif}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    변환 중...
                  </>
                ) : (
                  'GIF로 변환'
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                다운로드
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
