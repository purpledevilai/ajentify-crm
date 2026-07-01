'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/providers/auth-provider';
import * as authApi from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const CODE_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  const email = searchParams.get('email') ?? '';
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const submitCode = useCallback(
    async (code: string) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const res = await authApi.verifyCode(email, code);
        setAuth(res.access_token, res.member);
        router.push('/dashboard');
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.body.error_code === 'max_attempts') {
            toast.error('Too many attempts. Please request a new code.');
          } else {
            toast.error(err.message);
          }
        } else {
          toast.error('Verification failed. Please try again.');
        }
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, router, setAuth],
  );

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];

    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.slice(0, CODE_LENGTH).split('');
      for (let i = 0; i < CODE_LENGTH; i++) {
        newDigits[i] = pasted[i] ?? '';
      }
      setDigits(newDigits);
      const lastFilled = Math.min(pasted.length, CODE_LENGTH) - 1;
      inputRefs.current[lastFilled]?.focus();
      if (pasted.length >= CODE_LENGTH) {
        submitCode(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '') && newDigits.join('').length === CODE_LENGTH) {
      submitCode(newDigits.join(''));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    try {
      await authApi.resendCode(email);
      toast.success('Verification code resent');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to resend code.');
      }
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-center gap-2">
            {digits.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={CODE_LENGTH}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isSubmitting}
                className="h-12 w-10 text-center text-lg font-semibold"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <Button
            className="w-full"
            disabled={isSubmitting || digits.some((d) => !d)}
            onClick={() => submitCode(digits.join(''))}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Verify
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
            </button>
            <Link
              href="/create-account"
              className="text-muted-foreground hover:text-foreground"
            >
              Use a different email
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
