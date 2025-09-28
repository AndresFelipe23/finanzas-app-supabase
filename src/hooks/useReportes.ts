import { useState, useEffect, useMemo } from 'react';
import { useFinanceData } from './useFinanceData';
import { useTranslation } from '../context/LanguageContext';
import {
  FiltroReporte,
  EstadisticaReporte,
  DatoGrafico,
  DatoCategoria,
  ResumenPeriodo,
  ReporteCompleto,
  Transaccion,
  Categoria
} from '../types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Rangos de fechas predefinidos
export const RANGOS_FECHA = {
  hoy: {
    label: 'Hoy',
    fechaInicio: format(new Date(), 'yyyy-MM-dd'),
    fechaFin: format(new Date(), 'yyyy-MM-dd')
  },
  ayer: {
    label: 'Ayer',
    fechaInicio: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    fechaFin: format(subDays(new Date(), 1), 'yyyy-MM-dd')
  },
  ultimos7dias: {
    label: 'Últimos 7 días',
    fechaInicio: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    fechaFin: format(new Date(), 'yyyy-MM-dd')
  },
  ultimos30dias: {
    label: 'Últimos 30 días',
    fechaInicio: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
    fechaFin: format(new Date(), 'yyyy-MM-dd')
  },
  esteAno: {
    label: 'Este año',
    fechaInicio: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    fechaFin: format(endOfYear(new Date()), 'yyyy-MM-dd')
  },
  esteMes: {
    label: 'Este mes',
    fechaInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fechaFin: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  },
  mesAnterior: {
    label: 'Mes anterior',
    fechaInicio: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    fechaFin: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  }
};

export function useReportes() {
  const { transacciones, categorias, cuentas, loading } = useFinanceData();
  const { t } = useTranslation();

  // Rangos de fechas con traducciones dinámicas
  const RANGOS_FECHA_TRADUCIDOS = useMemo(() => ({
    hoy: {
      label: t('reportes.hoy'),
      fechaInicio: format(new Date(), 'yyyy-MM-dd'),
      fechaFin: format(new Date(), 'yyyy-MM-dd')
    },
    ayer: {
      label: t('reportes.ayer'),
      fechaInicio: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      fechaFin: format(subDays(new Date(), 1), 'yyyy-MM-dd')
    },
    ultimos7dias: {
      label: t('reportes.ultimos7Dias'),
      fechaInicio: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      fechaFin: format(new Date(), 'yyyy-MM-dd')
    },
    ultimos30dias: {
      label: t('reportes.ultimos30Dias'),
      fechaInicio: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
      fechaFin: format(new Date(), 'yyyy-MM-dd')
    },
    esteAno: {
      label: t('reportes.esteAno'),
      fechaInicio: format(startOfYear(new Date()), 'yyyy-MM-dd'),
      fechaFin: format(endOfYear(new Date()), 'yyyy-MM-dd')
    },
    esteMes: {
      label: t('reportes.esteMes'),
      fechaInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      fechaFin: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    },
    mesAnterior: {
      label: t('reportes.mesAnterior'),
      fechaInicio: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
      fechaFin: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
    }
  }), [t]);

  const [filtros, setFiltros] = useState<FiltroReporte>({
    fechaInicio: RANGOS_FECHA.esteMes.fechaInicio,
    fechaFin: RANGOS_FECHA.esteMes.fechaFin,
    categorias: [],
    cuentas: [],
    tipo: 'todos',
    periodo: 'mes'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Filtrar transacciones según los filtros aplicados
  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(transaccion => {
      const fecha = new Date(transaccion.fecha);
      const fechaStr = format(fecha, 'yyyy-MM-dd');

      // Filtro por fecha
      if (fechaStr < filtros.fechaInicio || fechaStr > filtros.fechaFin) {
        return false;
      }

      // Filtro por tipo
      if (filtros.tipo !== 'todos' && transaccion.tipo !== filtros.tipo) {
        return false;
      }

      // Filtro por categorías
      if (filtros.categorias && filtros.categorias.length > 0) {
        if (!filtros.categorias.includes(transaccion.categoria_id)) {
          return false;
        }
      }

      // Filtro por cuentas
      if (filtros.cuentas && filtros.cuentas.length > 0) {
        if (!filtros.cuentas.includes(transaccion.cuenta_id)) {
          return false;
        }
      }

      return true;
    });
  }, [transacciones, filtros]);

  // Calcular estadísticas generales
  const estadisticas = useMemo((): EstadisticaReporte => {
    const ingresos = transaccionesFiltradas.filter(t => t.tipo === 'ingreso');
    const gastos = transaccionesFiltradas.filter(t => t.tipo === 'gasto');

    const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0);
    const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0);
    const balance = totalIngresos - totalGastos;

    // Calcular promedio diario de gastos
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);
    const diasEnPeriodo = Math.max(1, Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const promedioGastosDiario = totalGastos / diasEnPeriodo;

    // Encontrar categoría top de gastos
    const gastosAgrupados = gastos.reduce((acc, t) => {
      acc[t.categoria_id] = (acc[t.categoria_id] || 0) + t.monto;
      return acc;
    }, {} as Record<string, number>);

    const categoriaTopGastoId = Object.keys(gastosAgrupados).reduce((a, b) =>
      gastosAgrupados[a] > gastosAgrupados[b] ? a : b, Object.keys(gastosAgrupados)[0]
    );

    const categoriaTopGasto = categoriaTopGastoId ? {
      nombre: categorias.find(c => c.id === categoriaTopGastoId)?.nombre || 'Sin categoría',
      monto: gastosAgrupados[categoriaTopGastoId],
      porcentaje: totalGastos > 0 ? (gastosAgrupados[categoriaTopGastoId] / totalGastos) * 100 : 0
    } : null;

    // Encontrar categoría top de ingresos
    const ingresosAgrupados = ingresos.reduce((acc, t) => {
      acc[t.categoria_id] = (acc[t.categoria_id] || 0) + t.monto;
      return acc;
    }, {} as Record<string, number>);

    const categoriaTopIngresoId = Object.keys(ingresosAgrupados).reduce((a, b) =>
      ingresosAgrupados[a] > ingresosAgrupados[b] ? a : b, Object.keys(ingresosAgrupados)[0]
    );

    const categoriaTopIngreso = categoriaTopIngresoId ? {
      nombre: categorias.find(c => c.id === categoriaTopIngresoId)?.nombre || 'Sin categoría',
      monto: ingresosAgrupados[categoriaTopIngresoId],
      porcentaje: totalIngresos > 0 ? (ingresosAgrupados[categoriaTopIngresoId] / totalIngresos) * 100 : 0
    } : null;

    return {
      totalIngresos,
      totalGastos,
      balance,
      transacciones: transaccionesFiltradas.length,
      promedioGastosDiario,
      categoriaTopGasto,
      categoriaTopIngreso
    };
  }, [transaccionesFiltradas, categorias, filtros]);

  // Generar datos para gráficos
  const datosGraficos = useMemo((): DatoGrafico[] => {
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);

    let intervalos: Date[];
    let formatoFecha: string;

    // Determinar intervalos según el periodo
    switch (filtros.periodo) {
      case 'dia':
        intervalos = eachDayOfInterval({ start: fechaInicio, end: fechaFin });
        formatoFecha = 'yyyy-MM-dd';
        break;
      case 'mes':
      default:
        intervalos = eachMonthOfInterval({ start: fechaInicio, end: fechaFin });
        formatoFecha = 'yyyy-MM';
        break;
    }

    return intervalos.map(fecha => {
      const fechaStr = format(fecha, formatoFecha);

      const transaccionesPeriodo = transaccionesFiltradas.filter(t => {
        const fechaTransaccion = format(new Date(t.fecha), formatoFecha);
        return fechaTransaccion === fechaStr;
      });

      const ingresos = transaccionesPeriodo
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

      const gastos = transaccionesPeriodo
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0);

      return {
        fecha: fechaStr,
        ingresos,
        gastos,
        balance: ingresos - gastos
      };
    });
  }, [transaccionesFiltradas, filtros]);

  // Agrupar por categorías
  const datosCategorias = useMemo(() => {
    const procesarCategorias = (tipo: 'ingreso' | 'gasto'): DatoCategoria[] => {
      const transaccionesTipo = transaccionesFiltradas.filter(t => t.tipo === tipo);
      const totalTipo = transaccionesTipo.reduce((sum, t) => sum + t.monto, 0);

      const agrupadas = transaccionesTipo.reduce((acc, t) => {
        if (!acc[t.categoria_id]) {
          const categoria = categorias.find(c => c.id === t.categoria_id);
          acc[t.categoria_id] = {
            id: t.categoria_id,
            nombre: categoria?.nombre || 'Sin categoría',
            color: categoria?.color || '#6B7280',
            icono: categoria?.icono || 'Tag',
            monto: 0,
            porcentaje: 0,
            transacciones: 0
          };
        }
        acc[t.categoria_id].monto += t.monto;
        acc[t.categoria_id].transacciones += 1;
        return acc;
      }, {} as Record<string, DatoCategoria>);

      return Object.values(agrupadas)
        .map(cat => ({
          ...cat,
          porcentaje: totalTipo > 0 ? (cat.monto / totalTipo) * 100 : 0
        }))
        .sort((a, b) => b.monto - a.monto);
    };

    return {
      ingresos: procesarCategorias('ingreso'),
      gastos: procesarCategorias('gasto')
    };
  }, [transaccionesFiltradas, categorias]);

  // Funciones para actualizar filtros
  const updateFiltros = (newFiltros: Partial<FiltroReporte>) => {
    setFiltros(prev => ({ ...prev, ...newFiltros }));
  };

  const aplicarRangoFecha = (rango: keyof typeof RANGOS_FECHA) => {
    const rangoSeleccionado = RANGOS_FECHA_TRADUCIDOS[rango];
    updateFiltros({
      fechaInicio: rangoSeleccionado.fechaInicio,
      fechaFin: rangoSeleccionado.fechaFin
    });
  };

  const resetFiltros = () => {
    setFiltros({
      fechaInicio: RANGOS_FECHA.esteMes.fechaInicio,
      fechaFin: RANGOS_FECHA.esteMes.fechaFin,
      categorias: [],
      cuentas: [],
      tipo: 'todos',
      periodo: 'mes'
    });
  };

  // Generar reporte completo
  const generarReporte = async (): Promise<ReporteCompleto> => {
    setIsGenerating(true);

    // Simular tiempo de generación
    await new Promise(resolve => setTimeout(resolve, 1000));

    const reporte: ReporteCompleto = {
      filtros,
      estadisticas,
      datosGraficos,
      categorias: datosCategorias,
      resumenPeriodos: [], // Se puede implementar según necesidades
      evoluciones: {
        ingresosMensuales: [], // Se puede implementar según necesidades
        gastosMensuales: [],
        balanceMensual: []
      }
    };

    setIsGenerating(false);
    return reporte;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return {
    // Estados
    filtros,
    transaccionesFiltradas,
    estadisticas,
    datosGraficos,
    datosCategorias,
    loading,
    isGenerating,

    // Funciones
    updateFiltros,
    aplicarRangoFecha,
    resetFiltros,
    generarReporte,
    formatCurrency,

    // Utilidades
    rangosDisponibles: RANGOS_FECHA_TRADUCIDOS
  };
}