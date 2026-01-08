import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { getSocket } from '../services/socket';
import { Play, Pause, Link as LinkIcon } from 'lucide-react';


interface SyncPlayerProps {
    isPaired: boolean;
}

export const SyncPlayer: React.FC<SyncPlayerProps> = ({ isPaired }) => {
    const socket = getSocket();
    const VideoPlayer = ReactPlayer as any;
    const playerRef = useRef<any>(null);
    
    // Local State
    const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isBuffering, setIsBuffering] = useState(false);
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        if (!socket || !isPaired) return;

        const handleServerState = (state: any) => {
            if (!state || !state.playbackState) return;

            const { videoSource, playbackState } = state;

            // 1. Sync URL from partner
            if (videoSource?.src && videoSource.src !== url) {
                console.log("Syncing URL:", videoSource.src);
                setUrl(videoSource.src);
            }

            // 2. Sync Play/Pause
            if (playbackState.isPlaying !== playing) {
                setPlaying(playbackState.isPlaying);
            }

            // 3. Sync Time (Prevent drift)
            if (playerRef.current) {
                // Safe access to getCurrentTime with fallback
                const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
                const serverTime = playbackState.currentTime;
                
                const timeSinceUpdate = (Date.now() - playbackState.lastUpdateTimestamp) / 1000;
                const adjustedServerTime = serverTime + (playbackState.isPlaying ? timeSinceUpdate : 0);

                // Only seek if we are off by more than 1 second (prevents stutter)
                if (Math.abs(currentTime - adjustedServerTime) > 1.0) {
                    isRemoteUpdate.current = true; 
                    playerRef.current.seekTo(adjustedServerTime, 'seconds');
                }
            }
        };

        socket.on('serverUpdateState', handleServerState);
        socket.on('room-joined', (data: any) => {
            if(data.initialState) handleServerState(data.initialState);
        });

        return () => {
            socket?.off('serverUpdateState');
            socket?.off('room-joined');
        };
    }, [socket, isPaired, url, playing]);


    // --- User Interaction Handlers ---

    const handlePlay = () => {
        setPlaying(true); 
        if (isPaired) {
            const currentTime = playerRef.current?.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
            
            socket?.emit('clientAction', {
                type: 'UPDATE_PLAYBACK_STATE',
                payload: { isPlaying: true, currentTime }
            });
        }
    };

    const handlePause = () => {
        setPlaying(false);
        if (isPaired) {
            const currentTime = playerRef.current?.getCurrentTime ? playerRef.current.getCurrentTime() : 0;

            socket?.emit('clientAction', {
                type: 'UPDATE_PLAYBACK_STATE',
                payload: { isPlaying: false, currentTime }
            });
        }
    };

    const handleProgress = (state: any) => {
        // We don't emit continuously to save bandwidth
    };

    const handleSeek = (seconds: number) => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        if (isPaired) {
            socket?.emit('clientAction', {
                type: 'UPDATE_PLAYBACK_TIME',
                payload: { currentTime: seconds }
            });
        }
    };
    
    const handleUrlChange = (e: React.FormEvent) => {
        e.preventDefault();
        const newUrl = prompt("Enter YouTube/Video URL:");
        if (newUrl) {
            setUrl(newUrl);
            setPlaying(true); 

            if (isPaired) {
                socket?.emit('clientAction', {
                    type: 'UPDATE_VIDEO_SOURCE',
                    payload: { type: 'youtube', src: newUrl }
                });
            }
        }
    };

    return (
        <div className="w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative group">
            <div className="relative w-full aspect-video bg-black">
                <VideoPlayer
                    ref={playerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    volume={volume}
                    controls={true}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeek={handleSeek}
                    onProgress={handleProgress}
                    onBuffer={() => setIsBuffering(true)}
                    onBufferEnd={() => setIsBuffering(false)}
                    style={{ pointerEvents: 'auto' }}
                />
                
                {/* Sync Indicator Overlay */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
                    <div className={`w-2 h-2 rounded-full ${isPaired ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                        {isPaired ? 'Live Sync' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="p-4 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-4">
                     <button onClick={() => setPlaying(!playing)} className="text-white hover:text-nothing-red transition-colors">
                        {playing ? <Pause size={20} /> : <Play size={20} />}
                     </button>
                     <div className="text-xs font-mono text-zinc-500 truncate max-w-[200px]">{url}</div>
                </div>
                
                <button 
                    onClick={handleUrlChange}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono transition-colors"
                >
                    <LinkIcon size={14} /> Change Video
                </button>
            </div>
        </div>
    );
};