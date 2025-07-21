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
          const { data: profileData, error: profileError } = await supabase.rpc(
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
          if (profileData && profileData.success) {
            setSuccessMessage('Registro exitoso. Revisa tu correo y confirma tu cuenta para poder iniciar sesión.');
          } else {
            setServerError('Error en el proceso de registro. Por favor, intenta de nuevo.');
          }
        } catch (profileErr) {
          console.error('Error creating profile:', profileErr);
          setServerError('Error en el proceso de registro. Por favor, intenta de nuevo.');
        }
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setServerError('Error inesperado durante el registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' } })}
              />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message as string}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Repite tu contraseña"
                minLength={6}
                {...register('confirmPassword', { required: 'Debes confirmar la contraseña', validate: (value: string) => value === watch('password') || 'Las contraseñas no coinciden' })}
              />
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