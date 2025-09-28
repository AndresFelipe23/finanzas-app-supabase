import React from 'react';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AwaitingConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center"
        >
          <MailCheck className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          ¡Casi listo! Confirma tu correo
        </h2>
        <p className="mt-4 text-gray-600">
          Hemos enviado un enlace de confirmación a tu dirección de correo electrónico. Por favor, haz clic en ese enlace para activar tu cuenta.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Si no ves el correo, revisa tu carpeta de spam.
        </p>
        <div className="mt-8">
          <Link
            to="/login"
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver a Iniciar Sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
