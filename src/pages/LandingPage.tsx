import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  TrendingUp,
  Target,
  BarChart3,
  Wallet,
  Tag,
  Calendar,
  ArrowRight
} from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: CreditCard,
      title: 'Gestión de Transacciones',
      description: 'Registra y categoriza todos tus ingresos y gastos de forma sencilla'
    },
    {
      icon: BarChart3,
      title: 'Reportes Detallados',
      description: 'Visualiza tu salud financiera con gráficos y estadísticas claras'
    },
    {
      icon: Target,
      title: 'Metas de Ahorro',
      description: 'Establece objetivos financieros y monitorea tu progreso'
    },
    {
      icon: Wallet,
      title: 'Múltiples Cuentas',
      description: 'Administra diferentes cuentas bancarias y de efectivo'
    },
    {
      icon: Tag,
      title: 'Categorización Inteligente',
      description: 'Organiza tus finanzas con categorías personalizables'
    },
    {
      icon: Calendar,
      title: 'Presupuestos Mensuales',
      description: 'Controla tus gastos con límites y alertas inteligentes'
    }
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-32">
          <nav className="flex justify-between items-center mb-16 sm:mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-medium text-gray-900">Financially</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-8"
            >
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Registrarse
              </Link>
            </motion.div>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Control total de tus finanzas
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Gestiona tu dinero de forma simple e intuitiva. Sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-8 py-4 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
                >
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-md hover:border-gray-400 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades esenciales
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Comienza hoy mismo
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sin tarjeta de crédito. Sin compromisos.
            </p>
            <Link
              to="/register"
              className="bg-gray-900 text-white px-8 py-4 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3 mb-4 sm:mb-0"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-medium text-gray-900">Financially</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-500 text-center sm:text-right"
            >
              <p>&copy; 2024 Financially. Todos los derechos reservados.</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
