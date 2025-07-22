'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>({ mode: 'onTouched' });
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: { email: string; password: string }) => {
    setServerError('');
    const { email, password } = data;
    try {
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      if (loginData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', loginData.user.id)
          .single();
        if (profileError) {
          setServerError('Error obteniendo información del usuario');
          return;
        }
        if (profile.role === 'admin') {
          router.push('/admin');
        } else if (profile.role === 'colaborador') {
          router.push('/colaborador');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
      setServerError('Error inesperado durante el login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión de Teatro
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base"
                placeholder="Email"
                {...register('email', { required: 'El email es obligatorio', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Email inválido' } })}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base pr-10"
                  placeholder="Contraseña"
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.236.336 4.675.938M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.657 0-3.236-.336-4.675-.938" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.336 1.057-.87 2.057-1.542 2.938" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message as string}</p>}
            </div>
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{serverError}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <div>
              <Link
                href="/recover-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div>
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
              >
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 