"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginForm } from '@/lib/schema';
import { useToast } from '@/hooks/useToast';

export function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const success = await login(data.email, data.password);
      
      if (success) {
        showToast({
          title: 'Signed in',
          description: 'Welcome back to Aura Élixir!',
          variant: 'success'
        });
        router.push('/');
      } else {
        setError('Invalid email or password');
        showToast({
          title: 'Sign in failed',
          description: 'Invalid email or password',
          variant: 'error'
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      showToast({
        title: 'Sign in failed',
        description: err.message || 'Please try again later.',
        variant: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-8 sm:py-10 md:py-12 px-4 sm:px-6 relative overflow-hidden">
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
            Welcome Back
          </h2>
          <p className="text-purple-200 text-lg">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl py-10 px-7 shadow-2xl rounded-2xl border border-purple-400/20 hover:shadow-2xl transition-shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 dark:bg-red-900/30 border border-red-400/50 text-red-200 px-5 py-4 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-purple-400" />
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
                <Lock className="h-5 w-5 text-purple-400" />
                <label className="text-white font-semibold text-sm">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-purple-500 focus:ring-2 focus:ring-purple-400 border-purple-300/50 dark:border-purple-700 rounded cursor-pointer bg-white/10"
                />
                <label htmlFor="remember-me" className="text-sm text-purple-200 font-medium hover:text-purple-100 transition-colors cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo Account Info - Enhanced */}

          {/* Trust Indicators */}
          <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-purple-400/20">
            <div className="flex items-center gap-2 text-xs text-purple-200">
              <Shield className="h-4 w-4 text-purple-400" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200">
              <span className="text-lg">✓</span>
              <span>Verified Site</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-purple-300 mt-8 space-x-1">
          <span>By signing in, you agree to our</span>
          <Link href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            Terms of Service
          </Link>
          <span>and</span>
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}