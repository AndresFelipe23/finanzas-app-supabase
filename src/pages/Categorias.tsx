import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Tag, TrendingUp, TrendingDown, Edit, Trash2, MoreVertical, X } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useCategorias } from '../hooks/useCategorias';
import { useTranslation } from '../context/LanguageContext';
import { IconRenderer } from '../components/IconRenderer';
import { COLORES_CATEGORIA, ICONOS_CATEGORIA } from '../constants/categorias';
import Swal from 'sweetalert2';
import '../components/Alerts/sweetalert.css';

type FilterType = 'todas' | 'ingreso' | 'gasto';

interface CreateCategoriaData {
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  color: string;
  descripcion: string;
  icono: string;
}

export function Categorias() {
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const { categorias, loading, createCategoria, updateCategoria, deleteCategoria, stats } = useCategorias();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todas');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateCategoriaData>({
    nombre: '',
    tipo: 'gasto',
    color: COLORES_CATEGORIA[0],
    descripcion: '',
    icono: ICONOS_CATEGORIA[0]
  });

  // Filtrar categorías
  const filteredCategorias = categorias.filter(categoria => {
    const matchesSearch = categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'todas' || categoria.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'gasto',
      color: COLORES_CATEGORIA[0],
      descripcion: '',
      icono: ICONOS_CATEGORIA[0]
    });
  };

  // Open create form
  const openCreateForm = () => {
    resetForm();
    setShowCreateForm(true);
  };

  // Open edit form
  const openEditForm = (categoria: any) => {
    console.log('=== ABRIENDO MODAL DE EDICION ===');
    console.log('Categoría seleccionada:', categoria);
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color,
      descripcion: categoria.descripcion || '',
      icono: categoria.icono
    });
    setEditingCategoria(categoria.id);
    console.log('Estado editingCategoria establecido a:', categoria.id);
  };

  // Close forms
  const closeForms = () => {
    setShowCreateForm(false);
    setEditingCategoria(null);
    resetForm();
  };

  const handleCreateCategoria = async () => {
    if (!formData.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre de la categoría es obligatorio.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    try {
      const result = await createCategoria(formData);
      if (result) {
        closeForms();
        Swal.fire({
          title: '¡Categoría creada!',
          text: `La categoría "${formData.nombre}" ha sido creada correctamente.`,
          icon: 'success',
          confirmButtonColor: '#059669'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la categoría.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleEditCategoria = async () => {
    console.log('=== INTENTANDO EDITAR CATEGORIA ===');
    console.log('FormData:', formData);
    console.log('EditingCategoria ID:', editingCategoria);

    if (!formData.nombre.trim()) {
      console.log('ERROR: Nombre vacío');
      Swal.fire({
        title: 'Error',
        text: 'El nombre de la categoría es obligatorio.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    if (!editingCategoria) {
      console.log('ERROR: No hay ID de categoría para editar');
      return;
    }

    try {
      console.log('Llamando a updateCategoria con:', { id: editingCategoria, ...formData });
      const result = await updateCategoria({ id: editingCategoria, ...formData });
      console.log('Resultado de updateCategoria:', result);

      if (result) {
        console.log('Edición exitosa, cerrando formularios');
        closeForms();
        Swal.fire({
          title: '¡Categoría actualizada!',
          text: `La categoría "${formData.nombre}" ha sido actualizada correctamente.`,
          icon: 'success',
          confirmButtonColor: '#059669'
        });
      }
    } catch (error) {
      console.log('ERROR en handleEditCategoria:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la categoría.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleDeleteCategoria = async (id: string, nombre: string) => {
    console.log('=== INTENTANDO ELIMINAR CATEGORIA ===');
    console.log('ID a eliminar:', id);
    console.log('Nombre:', nombre);

    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      html: `
        <div class="text-left">
          <p class="text-gray-600 mb-3">Estás a punto de eliminar la categoría:</p>
          <div class="bg-gray-50 p-3 rounded-lg mb-3">
            <p class="font-semibold text-gray-900">${nombre}</p>
          </div>
          <p class="text-red-600 text-sm">⚠️ Esta acción no se puede deshacer.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    });

    console.log('Usuario confirmó eliminación:', result.isConfirmed);

    if (result.isConfirmed) {
      try {
        console.log('Llamando a deleteCategoria con ID:', id);
        await deleteCategoria(id);
        console.log('deleteCategoria ejecutado sin errores');

        setOpenMenuId(null);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La categoría ha sido eliminada correctamente.',
          icon: 'success',
          confirmButtonColor: '#059669'
        });
      } catch (error) {
        console.log('ERROR en handleDeleteCategoria:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la categoría.',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('categorias.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {t('categorias.subtitle')}
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>{t('categorias.nuevaCategoria')}</span>
          </button>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('categorias.total')}</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('categorias.ingresos')}</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">{stats.ingresos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('categorias.gastos')}</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">{stats.gastos}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controles de búsqueda y filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder={t('categorias.buscar')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white/60 dark:bg-dark-800/60 border border-gray-200/50 dark:border-dark-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="bg-white/60 dark:bg-dark-800/60 border border-gray-200/50 dark:border-dark-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 text-gray-900 dark:text-gray-100"
            >
              <option value="todas">{t('categorias.todas')}</option>
              <option value="ingreso">{t('categorias.ingresos')}</option>
              <option value="gasto">{t('categorias.gastos')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de categorías */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredCategorias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategorias.map((categoria, index) => (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300 group relative"
              >
                <div
                  className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                  style={{ backgroundColor: categoria.color }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: categoria.color }}
                    >
                      <IconRenderer iconName={categoria.icono} className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg tracking-tight">
                        {categoria.nombre}
                      </h3>
                      <p className={`text-sm font-medium ${
                        categoria.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {categoria.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={() => {
                        console.log('=== CLIC EN BOTON EDITAR ===');
                        console.log('Categoria para editar:', categoria);
                        openEditForm(categoria);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="Editar categoría"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        console.log('=== CLIC EN BOTON ELIMINAR ===');
                        console.log('Categoria para eliminar:', categoria.id, categoria.nombre);
                        handleDeleteCategoria(categoria.id, categoria.nombre);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {categoria.descripcion && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {categoria.descripcion}
                  </p>
                )}

              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay categorías</h3>
            <p className="text-gray-500 dark:text-gray-400 font-light mb-6">
              {searchTerm || filterType !== 'todas'
                ? 'No se encontraron categorías con los filtros aplicados.'
                : 'Crea tu primera categoría para organizar tus transacciones.'
              }
            </p>
            {!searchTerm && filterType === 'todas' && (
              <button
                onClick={openCreateForm}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Crear Categoría</span>
              </button>
            )}
          </div>
        )}
      </motion.div>


      {/* Modal de crear categoría */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
              onClick={closeForms}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">{t('categorias.nuevaCategoria')}</h2>
                <button
                  onClick={closeForms}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('categorias.nombre')} *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder={t('categorias.placeholderNombre')}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('categorias.tipo')} *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'ingreso' | 'gasto' })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    >
                      <option value="gasto">{t('formularios.gasto')}</option>
                      <option value="ingreso">{t('formularios.ingreso')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('categorias.descripcion')}
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder={t('categorias.descripcionOpcional')}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('categorias.color')}
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {COLORES_CATEGORIA.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                            formData.color === color ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-200 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('categorias.icono')}
                    </label>
                    <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-dark-600 rounded-xl p-3 bg-gray-50 dark:bg-dark-700">
                      {ICONOS_CATEGORIA.map((icono) => (
                        <button
                          key={icono}
                          type="button"
                          onClick={() => setFormData({ ...formData, icono })}
                          className={`w-10 h-10 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                            formData.icono === icono
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-800'
                          }`}
                        >
                          <IconRenderer iconName={icono} size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botones - Ocupan ambas columnas */}
                <div className="lg:col-span-2 flex space-x-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <button
                    type="button"
                    onClick={closeForms}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200"
                  >
                    {t('categorias.cancelar')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategoria}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {t('categorias.crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de editar categoría */}
      <AnimatePresence>
        {editingCategoria && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
              onClick={closeForms}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">{t('categorias.editarCategoria')}</h2>
                <button
                  onClick={closeForms}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('categorias.nombre')} *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder={t('categorias.placeholderNombre')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('categorias.tipo')} *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'ingreso' | 'gasto' })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 text-gray-900 dark:text-gray-100"
                  >
                    <option value="gasto">{t('formularios.gasto')}</option>
                    <option value="ingreso">{t('formularios.ingreso')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('categorias.color')}
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {COLORES_CATEGORIA.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                          formData.color === color ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-200 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('categorias.icono')}
                  </label>
                  <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                    {ICONOS_CATEGORIA.map((icono) => (
                      <button
                        key={icono}
                        type="button"
                        onClick={() => setFormData({ ...formData, icono })}
                        className={`w-10 h-10 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          formData.icono === icono
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-800'
                        }`}
                      >
                        <IconRenderer iconName={icono} size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('categorias.descripcion')}
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder={t('categorias.descripcionOpcional')}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForms}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200"
                  >
                    {t('categorias.cancelar')}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCategoria}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {t('categorias.actualizar')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}