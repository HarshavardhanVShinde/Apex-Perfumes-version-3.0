"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signupSchema, type SignupForm } from '@/lib/schema';
import { useToast } from '@/hooks/useToast';

export function Signup() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      setError('');
      const success = await signup(data);
      if (success) {
        showToast({
          title: 'Account created',
          description: 'Welcome to Aura Essence! You are signed in.',
          variant: 'success'
        });
        router.push('/');
      } else {
        // If Supabase requires email verification, user may not be signed in
        setError('Please check your email to verify your account, then sign in.');
        showToast({
          title: 'Verify your email',
          description: 'We sent a verification link to your inbox.',
          variant: 'info'
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      showToast({
        title: 'Sign up failed',
        description: err.message || 'Please try again later.',
        variant: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12 px-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-5xl font-bold tracking-widest text-white hover:text-purple-300 transition-colors inline-block mb-8"
          >
            AURA
          </Link>
          <h2 className="text-4xl font-bold text-white mb-3">
            Create Your Account
          </h2>
          <p className="text-purple-200 text-lg">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl py-10 px-7 shadow-2xl rounded-2xl border border-purple-400/20 hover:shadow-2xl transition-shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 dark:bg-red-900/30 border border-red-400/50 text-red-200 px-5 py-4 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-400" />
                  <label className="text-white font-semibold text-xs">First Name</label>
                </div>
                <Input
                  placeholder="John"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  className="bg-white/5 border-purple-400/30 text-white placeholder:text-white/40 text-sm"
                />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-400" />
                  <label className="text-white font-semibold text-xs">Last Name</label>
                </div>
                <Input
                  placeholder="Doe"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  className="bg-white/5 border-purple-400/30 text-white placeholder:text-white/40 text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <label className="text-white font-semibold text-sm">Email Address</label>
              </div>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email?.message}
                className="bg-white/5 border-purple-400/30 text-white placeholder:text-white/40"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="h-4 w-4 text-purple-400" />
                <label className="text-white font-semibold text-sm">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                  className="bg-white/5 border-purple-400/30 text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-4 w-4 text-purple-400" />
                <label className="text-white font-semibold text-sm">Confirm Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  className="bg-white/5 border-purple-400/30 text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  required
                  className="h-5 w-5 text-purple-500 focus:ring-2 focus:ring-purple-400 border-purple-300/50 rounded cursor-pointer bg-white/10"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="agree" className="text-purple-200 font-medium">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Benefits Section */}
          <div className="mt-8 space-y-3 pt-8 border-t border-purple-400/20">
            <div className="flex items-center gap-2 text-xs text-purple-200 hover:text-purple-100 transition-colors">
              <span className="text-lg">🎁</span>
              <span>Exclusive member discounts & rewards</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200 hover:text-purple-100 transition-colors">
              <span className="text-lg">⭐</span>
              <span>Early access to new fragrances</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200 hover:text-purple-100 transition-colors">
              <span className="text-lg">🎯</span>
              <span>Personalized recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200 hover:text-purple-100 transition-colors">
              <span className="text-lg">📦</span>
              <span>Free shipping on all orders</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-purple-300 mt-8">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}