import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, EyeOff, CreditCard, Wallet, PiggyBank, TrendingUp, Edit, Trash2, Building, DollarSign } from 'lucide-react';
import { useCuentas } from '../hooks/useCuentas';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import { CreateCuentaForm } from '../components/Forms/CreateCuentaForm';
import { EditCuentaForm } from '../components/Forms/EditCuentaForm';
import { Cuenta } from '../types';
import Swal from 'sweetalert2';
import '../components/Alerts/sweetalert.css';

export function Cuentas() {
  const {
    cuentas,
    loading,
    error,
    addCuenta,
    updateCuenta,
    deleteCuenta,
    toggleCuentaActiva,
    totalBalance,
    totalCredito,
    totalAhorro,
    cuentasPorTipo,
    cuentasActivas,
    cuentasInactivas
  } = useCuentas();

  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [editingCuenta, setEditingCuenta] = useState<Cuenta | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'efectivo':
        return Wallet;
      case 'ahorro':
        return PiggyBank;
      case 'credito':
        return CreditCard;
      case 'inversion':
        return TrendingUp;
      default:
        return Wallet;
    }
  };

  const getColorForTipo = (tipo: string) => {
    switch (tipo) {
      case 'efectivo':
        return 'bg-green-100 text-green-600';
      case 'ahorro':
        return 'bg-blue-100 text-blue-600';
      case 'credito':
        return 'bg-red-100 text-red-600';
      case 'inversion':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAddCuenta = async (data: any) => {
    const success = await addCuenta(data);
    if (success) {
      setShowForm(false);

      await Swal.fire({
        title: '¡Cuenta creada!',
        text: 'La cuenta ha sido creada exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-popup'
        }
      });
    } else {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la cuenta. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'swal2-popup'
        }
      });
    }
  };

  const handleDeleteCuenta = async (cuenta: Cuenta) => {
    const result = await Swal.fire({
      title: '¿Eliminar cuenta?',
      html: `
        <div class="text-left">
          <p class="text-gray-600 mb-3">¿Estás seguro de que quieres eliminar la cuenta:</p>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="font-semibold text-gray-900">${cuenta.nombre}</p>
            ${cuenta.banco ? `<p class="text-sm text-gray-600">${cuenta.banco}</p>` : ''}
            <p class="text-sm font-medium text-blue-600">${formatCurrency(cuenta.saldo)}</p>
          </div>
          <p class="text-red-600 text-sm mt-3">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container'
      }
    });

    if (result.isConfirmed) {
      const success = await deleteCuenta(cuenta.id);

      if (success) {
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La cuenta ha sido eliminada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-popup'
          }
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'swal2-popup'
          }
        });
      }
    }
  };

  const handleEditCuenta = async (id: string, data: any) => {
    const success = await updateCuenta(id, data);
    if (success) {
      setEditingCuenta(null);

      await Swal.fire({
        title: '¡Cuenta actualizada!',
        text: 'Los cambios han sido guardados exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-popup'
        }
      });
    } else {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'swal2-popup'
        }
      });
    }
    return success;
  };

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-4 sm:p-6 pt-20 lg:pt-6 flex items-center justify-center h-64 transition-all duration-300`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300`}>
      {/* Header minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('cuentas.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {cuentas.length} {cuentas.length !== 1 ? t('cuentas.cuentas') : t('cuentas.cuenta')} • {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="group relative p-3 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
              title={showBalances ? t('cuentas.ocultarSaldos') : t('cuentas.mostrarSaldos')}
            >
              {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <div className="absolute inset-0 bg-gray-100 dark:bg-dark-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>{t('cuentas.nueva')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Resumen financiero minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patrimonio</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                {showBalances ? formatCurrency(totalBalance) : '••••••'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ahorros</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                {showBalances ? formatCurrency(totalAhorro) : '••••••'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deudas</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                {showBalances ? formatCurrency(totalCredito) : '••••••'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de cuentas minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {cuentas.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-3">
              No hay cuentas registradas
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">
              Comienza agregando tu primera cuenta
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gray-900 dark:bg-gray-800 text-white px-8 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              Agregar cuenta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cuentas.map((cuenta, index) => {
              const Icon = getIconForTipo(cuenta.tipo);

              return (
                <motion.div
                  key={cuenta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 hover:shadow-lg transition-all duration-300 ${
                    !cuenta.activa && 'opacity-60 hover:opacity-75'
                  }`}
                >
                  {/* Status indicator */}
                  <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${
                    cuenta.activa ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center">
                        <Icon className="h-7 w-7 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">{cuenta.nombre}</h3>
                        {cuenta.banco && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{cuenta.banco}</p>
                        )}
                        {cuenta.numero_cuenta && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cuenta.numero_cuenta}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCuenta(cuenta)}
                        className="p-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all"
                        title="Editar cuenta"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCuenta(cuenta)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Saldo principal */}
                  <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Saldo actual
                    </p>
                    <p className={`text-4xl font-light tracking-tight ${
                      cuenta.tipo === 'credito'
                        ? cuenta.saldo < 0 ? 'text-red-600' : 'text-emerald-600'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {showBalances ? formatCurrency(cuenta.saldo) : '••••••'}
                    </p>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-4">
                    {/* Límite de crédito */}
                    {cuenta.tipo === 'credito' && cuenta.limite_credito && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Límite disponible</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {showBalances ? formatCurrency(cuenta.limite_credito - Math.abs(cuenta.saldo)) : '••••••'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((Math.abs(cuenta.saldo) / cuenta.limite_credito) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Detalles adicionales */}
                    {(cuenta.interes || cuenta.fecha_vencimiento || cuenta.descripcion) && (
                      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-dark-700">
                        {cuenta.descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">{cuenta.descripcion}</p>
                        )}
                        {cuenta.interes && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Interés:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{cuenta.interes}%</span>
                          </div>
                        )}
                        {cuenta.fecha_vencimiento && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Vencimiento:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(cuenta.fecha_vencimiento).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle activa */}
                    <div className="flex items-center justify-between pt-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        cuenta.activa
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {cuenta.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <button
                        onClick={() => toggleCuentaActiva(cuenta.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
                      >
                        {cuenta.activa ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Formularios */}
      <CreateCuentaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddCuenta}
      />

      <EditCuentaForm
        isOpen={!!editingCuenta}
        cuenta={editingCuenta}
        onClose={() => setEditingCuenta(null)}
        onSubmit={handleEditCuenta}
      />
    </div>
  );
}