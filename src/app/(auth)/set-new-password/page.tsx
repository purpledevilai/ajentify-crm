'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/providers/auth-provider';
import * as authApi from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordRules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /\d/.test(v) },
  { label: 'Special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Needs an uppercase letter')
      .regex(/[a-z]/, 'Needs a lowercase letter')
      .regex(/\d/, 'Needs a number')
      .regex(/[^A-Za-z0-9]/, 'Needs a special character'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

export default function SetNewPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>}>
      <SetNewPasswordContent />
    </Suspense>
  );
}

function SetNewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const [passwordValue, setPasswordValue] = useState('');

  const email = searchParams.get('email') ?? '';
  const code = searchParams.get('code') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
  });

  async function onSubmit(data: SetPasswordForm) {
    try {
      const res = await authApi.setNewPassword({
        email,
        code,
        new_password: data.password,
      });
      setAuth(res.access_token, res.member);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            <ul className="mt-1 grid gap-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(passwordValue);
                return (
                  <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                    {passed ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <X className="size-3 text-muted-foreground" />
                    )}
                    <span className={cn(passed ? 'text-green-600' : 'text-muted-foreground')}>
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
            />
            {errors.confirm && (
              <p className="text-xs text-destructive">{errors.confirm.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
