'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{ full_name: string; email: string; password: string; confirmPassword: string }>({
    mode: 'onTouched',
  });
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const router = useRouter(); // No se usa actualmente

  // Validación asíncrona para email duplicado
  const validateEmailUnique = async (email: string) => {
    if (!email) return true;
    // Consulta a Supabase para ver si ya existe el email
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (error) return 'Error validando email';
    if (data) return 'Ya existe un usuario con ese email';
    return true;
  };

  const onSubmit = async (data: { full_name: string; email: string; password: string; confirmPassword: string }) => {
    setServerError('');
    setSuccessMessage('');
    const { full_name, email, password, confirmPassword } = data;
    if (password !== confirmPassword) {
      setServerError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setServerError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      if (signUpData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const { error: profileError } = await supabase.rpc(
            'create_user_profile',
            {
              user_id: signUpData.user.id,
              user_email: signUpData.user.email || email,
              full_name: full_name
            }
          );
          if (profileError) {
            setServerError(`Error creando perfil de usuario: ${profileError.message}`);
            return;
          }
          // Si el rol es colaborador, crea el registro en colaboradores
          // (por defecto, todos los nuevos son colaboradores)
          await supabase.from('colaboradores').insert([
            {
              id: signUpData.user.id,
              nombre: full_name,
              email: email
            }
          ]);
          setSuccessMessage('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
        } catch {
          setServerError('Error inesperado al crear el perfil de usuario');
        }
      }
    } catch {
      setServerError('Error inesperado durante el registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrarse
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión de Teatro
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base"
                placeholder="Ej: Juan Pérez"
                {...register('full_name', { required: 'El nombre es obligatorio' })}
              />
              {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name.message as string}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base"
                placeholder="tu@email.com"
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Email inválido' },
                  validate: validateEmailUnique
                })}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base pr-10"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' } })}
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base pr-10"
                  placeholder="Repite tu contraseña"
                  minLength={6}
                  {...register('confirmPassword', { required: 'Debes confirmar la contraseña', validate: (value: string) => value === watch('password') || 'Las contraseñas no coinciden' })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.236.336 4.675.938M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.657 0-3.236-.336-4.675-.938" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.336 1.057-.87 2.057-1.542 2.938" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message as string}</p>}
            </div>
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{serverError}</div>
            </div>
          )}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 