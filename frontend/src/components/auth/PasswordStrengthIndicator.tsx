'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    return {
      score,
      checks,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      color: score < 2 ? 'bg-red-500' : score < 4 ? 'bg-yellow-500' : 'bg-green-500',
    };
  };

  const { score, checks, strength, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 w-full rounded-full transition-colors',
              level <= score ? color : 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          'font-medium',
          strength === 'weak' && 'text-red-500',
          strength === 'medium' && 'text-yellow-500',
          strength === 'strong' && 'text-green-500'
        )}>
          Password strength: {strength}
        </span>
        <span className="text-muted-foreground">{score}/5</span>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        {Object.entries(checks).map(([key, passed]) => (
          <div key={key} className="flex items-center space-x-2">
            <div className={cn(
              'w-1 h-1 rounded-full',
              passed ? 'bg-green-500' : 'bg-muted'
            )} />
            <span className={cn(
              passed ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {key === 'length' && 'At least 8 characters'}
              {key === 'lowercase' && 'One lowercase letter'}
              {key === 'uppercase' && 'One uppercase letter'}
              {key === 'number' && 'One number'}
              {key === 'special' && 'One special character'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
