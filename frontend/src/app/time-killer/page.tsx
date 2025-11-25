'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type GameState = 'idle' | 'running' | 'ended';

export default function TimeKillerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [speed, setSpeed] = useState(5);
  const [message, setMessage] = useState<string | null>(null);

  // simple runner state
  const player = useRef({ y: 0, vy: 0, jumping: false });
  const obstacle = useRef({ x: 500, width: 30, cleared: false });
  const animation = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  const reset = () => {
    setScore(0);
    setSpeed(5);
    setTimeLeft(60);
    setState('idle');
    setMessage(null);
    player.current = { y: 0, vy: 0, jumping: false };
    obstacle.current = { x: 500, width: 30, cleared: false };
    lastTime.current = null;
    if (animation.current) cancelAnimationFrame(animation.current);
  };

  const jump = () => {
    if (state !== 'running') return;
    if (!player.current.jumping) {
      player.current.vy = -9;
      player.current.jumping = true;
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ground = canvas.height - 40;

    const step = (timestamp: number) => {
      if (state !== 'running') return;
      if (lastTime.current === null) lastTime.current = timestamp;
      const delta = timestamp - lastTime.current;
      lastTime.current = timestamp;

      // update timer
      setTimeLeft((prev) => Math.max(0, prev - delta / 1000));
      if (timeLeft <= 0) {
        setState('ended');
        setMessage('Run over.');
        return;
      }

      // physics
      player.current.vy += 0.5;
      player.current.y += player.current.vy;
      if (player.current.y > 0) {
        player.current.y = 0;
        player.current.vy = 0;
        player.current.jumping = false;
      }

      // obstacle movement
      obstacle.current.x -= speed;
      if (obstacle.current.x + obstacle.current.width < 0) {
        obstacle.current.x = canvas.width + Math.random() * 100;
        obstacle.current.cleared = false;
        setScore((s) => s + 1);
        setSpeed((spd) => Math.min(spd + 0.2, 14));
      }

      // collision
      const playerX = 80;
      const playerY = ground + player.current.y - 30;
      const playerSize = 30;
      const obsX = obstacle.current.x;
      const obsY = ground - 30;
      const obsW = obstacle.current.width;
      const obsH = 30;
      const hit =
        playerX < obsX + obsW &&
        playerX + playerSize > obsX &&
        playerY < obsY + obsH &&
        playerY + playerSize > obsY;

      if (hit) {
        setState('ended');
        setMessage('Run over.');
        return;
      }
      if (!hit && playerX > obsX + obsW && !obstacle.current.cleared) {
        obstacle.current.cleared = true;
      }

      // draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ground
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, ground, canvas.width, 4);

      // player
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(playerX, playerY, playerSize, playerSize);

      // obstacle
      ctx.fillStyle = obstacle.current.cleared ? '#22c55e' : '#ef4444';
      ctx.fillRect(obsX, obsY, obsW, obsH);

      // HUD
      ctx.fillStyle = '#111827';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`Score: ${score}`, 16, 24);
      ctx.fillText(`Time: ${timeLeft.toFixed(1)}s`, 16, 44);
      ctx.fillText(`Speed: ${speed.toFixed(1)}`, 16, 64);

      animation.current = requestAnimationFrame(step);
    };

    if (state === 'running') {
      animation.current = requestAnimationFrame(step);
    }

    return () => {
      if (animation.current) cancelAnimationFrame(animation.current);
    };
  }, [state, score, speed, timeLeft]);

  const startGame = () => {
    reset();
    setState('running');
    lastTime.current = null;
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-muted/30">
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Time Killer</h1>
              <p className="text-sm text-muted-foreground">You have 60 seconds. Click or press space to jump over tasks. Faster over time.</p>
            </div>
            <Button onClick={startGame} disabled={state === 'running'}>
              {state === 'running' ? 'Running...' : 'Start'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Track</CardTitle>
              <CardDescription>Jump the red task blocks. Each pass adds a point and increases speed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className="relative overflow-hidden rounded-xl border bg-white"
                onClick={jump}
              >
                <canvas ref={canvasRef} width={720} height={240} className="w-full h-[240px] bg-white" />
                {state !== 'running' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg font-semibold">
                    {state === 'idle' ? 'Click Start, then jump with click or Space' : 'Run over. Click Start to try again.'}
                  </div>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <span className="font-semibold">Score: {score}</span>
                <span>Time left: {timeLeft.toFixed(1)}s</span>
                <span>Speed: {speed.toFixed(1)}</span>
              </div>
              {message && <div className="text-sm text-emerald-700">{message}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
              <CardDescription>Simple, fast, 1-minute sprint.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>- Game ends after 60 seconds or on collision.</p>
              <p>- Each cleared task block adds 1 point and increases speed.</p>
              <p>- Click or press Space to jump.</p>
              <p>- Your best runs feed into the leaderboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
}
