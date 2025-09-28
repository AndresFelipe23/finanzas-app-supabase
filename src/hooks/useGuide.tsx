import { useCallback, useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTranslation } from '../context/LanguageContext';

export interface GuideStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  };
}

export interface GuideConfig {
  showProgress: boolean;
  allowClose: boolean;
  smoothScroll: boolean;
  showButtons: string[];
  doneBtnText: string;
  closeBtnText: string;
  nextBtnText: string;
  prevBtnText: string;
  popoverClass: string;
  overlayColor: string;
  onDestroyStarted?: () => void;
  onDestroyed?: () => void;
}

const LOCAL_STORAGE_KEY = 'financially_completed_guides';

export const useGuide = () => {
  const { t } = useTranslation();
  const [completedGuides, setCompletedGuides] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Configuración base para todas las guías con efectos mejorados
  const baseConfig: GuideConfig = {
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
    showButtons: ['next', 'previous', 'close'],
    doneBtnText: '🎉 ¡Completar!',
    closeBtnText: '✕',
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    popoverClass: 'financially-guide-popover',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    onDestroyed: () => {
      // Cleanup cuando se cierra la guía
      // Efecto de confetti virtual al completar
      if (typeof window !== 'undefined' && window.innerWidth > 768) {
        // Solo en desktop para no afectar performance en móviles
        setTimeout(() => {
          console.log('🎉 ¡Guía completada!');
        }, 100);
      }
    }
  };

  // Guardar guías completadas en localStorage
  const markGuideAsCompleted = useCallback((guideId: string) => {
    setCompletedGuides(prev => {
      const updated = [...prev, guideId];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Verificar si una guía fue completada
  const isGuideCompleted = useCallback((guideId: string) => {
    return completedGuides.includes(guideId);
  }, [completedGuides]);

  // Resetear todas las guías completadas
  const resetCompletedGuides = useCallback(() => {
    setCompletedGuides([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  // Función principal para iniciar una guía
  const startGuide = useCallback((
    guideId: string,
    steps: GuideStep[],
    config: Partial<GuideConfig> = {},
    force: boolean = false
  ) => {
    // Si la guía ya fue completada y no es forzada, no mostrarla
    if (!force && isGuideCompleted(guideId)) {
      return;
    }

    const mergedConfig = { ...baseConfig, ...config };

    const driverInstance = driver({
      ...mergedConfig,
      steps,
      onDestroyed: () => {
        markGuideAsCompleted(guideId);
        mergedConfig.onDestroyed?.();
      }
    });

    driverInstance.drive();
    return driverInstance;
  }, [baseConfig, isGuideCompleted, markGuideAsCompleted]);

  // Guías predefinidas para diferentes secciones
  const guides = {
    dashboard: (): GuideStep[] => [
      {
        popover: {
          title: '✨ ¡Bienvenido a Financially!',
          description: 'Te damos la bienvenida a tu centro de control financiero personalizado. Esta guía interactiva te mostrará cómo dominar tus finanzas en pocos minutos.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="header-title"]',
        popover: {
          title: '📊 Tu Dashboard Financiero',
          description: 'Este es tu centro de comando. Aquí visualizas tu situación financiera actual, tendencias y el balance de tus períodos seleccionados. ¡Todo en tiempo real!',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="quick-actions"]',
        popover: {
          title: '⚡ Acciones Rápidas',
          description: 'Los atajos más importantes están aquí. Agrega transacciones al instante, revisa presupuestos o analiza reportes sin perder tiempo navegando.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="balance-card"]',
        popover: {
          title: '💰 Tu Patrimonio Total',
          description: 'La cifra más importante: tu patrimonio neto. Se calcula automáticamente sumando todas tus cuentas activas. ¡Míralo crecer mes a mes!',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="income-card"]',
        popover: {
          title: 'Ingresos del Período',
          description: 'Aquí ves todos los ingresos del período seleccionado. Puedes cambiar el período en los controles superiores.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="expense-card"]',
        popover: {
          title: 'Gastos del Período',
          description: 'Esta tarjeta muestra tus gastos del período, incluyendo la tendencia comparativa con el mes anterior.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="top-category-card"]',
        popover: {
          title: 'Categoría Principal',
          description: 'Aquí puedes ver cuál es la categoría en la que más has gastado en el período actual.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="recent-transactions"]',
        popover: {
          title: 'Actividad Reciente',
          description: 'Esta sección muestra tus últimas transacciones. Puedes hacer clic en "Ver todas" para acceder a la gestión completa.',
          position: 'left'
        }
      },
      {
        element: '[data-guide="expense-chart"]',
        popover: {
          title: 'Gráfico de Gastos',
          description: 'Visualiza la distribución de tus gastos por categoría de forma gráfica.',
          position: 'left'
        }
      },
      {
        element: '[data-guide="budget-summary"]',
        popover: {
          title: 'Resumen de Presupuestos',
          description: 'Aquí puedes ver el progreso de tus presupuestos del mes actual y cuánto te queda por gastar en cada categoría.',
          position: 'top'
        }
      },
      {
        popover: {
          title: '🚀 ¡Estás listo para despegar!',
          description: 'Has completado el tour del dashboard. Ahora explora el resto de funcionalidades usando el menú lateral. ¡Tu futuro financiero comienza aquí!',
          position: 'center'
        }
      }
    ],

    transacciones: (): GuideStep[] => [
      {
        popover: {
          title: 'Gestión de Transacciones',
          description: 'En esta sección puedes ver, crear, editar y eliminar todas tus transacciones financieras.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="new-transaction-btn"]',
        popover: {
          title: 'Nueva Transacción',
          description: 'Haz clic aquí para agregar una nueva transacción de ingreso o gasto.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="transaction-filters"]',
        popover: {
          title: 'Filtros',
          description: 'Utiliza estos filtros para buscar transacciones específicas por fecha, tipo, categoría o cuenta.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="transactions-list"]',
        popover: {
          title: 'Lista de Transacciones',
          description: 'Aquí aparecen todas tus transacciones ordenadas por fecha. Puedes editarlas o eliminarlas directamente.',
          position: 'top'
        }
      }
    ],

    cuentas: (): GuideStep[] => [
      {
        popover: {
          title: 'Gestión de Cuentas',
          description: 'Administra todas tus cuentas bancarias, billeteras y métodos de pago desde aquí.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="new-account-btn"]',
        popover: {
          title: 'Nueva Cuenta',
          description: 'Agrega una nueva cuenta bancaria, tarjeta de crédito o billetera digital.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="accounts-grid"]',
        popover: {
          title: 'Tus Cuentas',
          description: 'Aquí puedes ver todas tus cuentas con sus saldos actuales. Puedes editarlas o archivarlas según necesites.',
          position: 'top'
        }
      }
    ],

    presupuestos: (): GuideStep[] => [
      {
        popover: {
          title: 'Control de Presupuestos',
          description: 'Establece límites de gasto por categoría y mantén tus finanzas bajo control.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="new-budget-btn"]',
        popover: {
          title: 'Nuevo Presupuesto',
          description: 'Crea un presupuesto mensual para cualquier categoría de gastos.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="budgets-list"]',
        popover: {
          title: 'Tus Presupuestos',
          description: 'Visualiza el progreso de todos tus presupuestos. Las barras de progreso te muestran cuánto has gastado del límite establecido.',
          position: 'top'
        }
      }
    ],

    reportes: (): GuideStep[] => [
      {
        popover: {
          title: 'Reportes y Análisis',
          description: 'Obtén insights detallados sobre tus hábitos financieros con gráficos y estadísticas.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="report-filters"]',
        popover: {
          title: 'Filtros de Reporte',
          description: 'Selecciona el período y las categorías que quieres analizar para generar reportes personalizados.',
          position: 'bottom'
        }
      },
      {
        element: '[data-guide="charts-section"]',
        popover: {
          title: 'Gráficos Interactivos',
          description: 'Explora tus datos financieros con diferentes tipos de gráficos: barras, pastel, líneas de tendencia, etc.',
          position: 'top'
        }
      }
    ]
  };

  // Función para iniciar la guía de primera vez
  const startFirstTimeGuide = useCallback(() => {
    if (!isGuideCompleted('first-time')) {
      startGuide('first-time', guides.dashboard(), {
        onDestroyed: () => {
          markGuideAsCompleted('first-time');
        }
      }, true); // Forzar que se muestre
    }
  }, [startGuide, guides, isGuideCompleted, markGuideAsCompleted]);

  // Función para detectar si es un usuario nuevo (basado en localStorage)
  const isNewUser = useCallback(() => {
    try {
      const hasSeenApp = localStorage.getItem('financially_has_seen_app');
      if (!hasSeenApp) {
        localStorage.setItem('financially_has_seen_app', 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Función para forzar la guía de bienvenida
  const triggerWelcomeGuide = useCallback(() => {
    // Siempre mostrar la guía de bienvenida cuando se llama esta función
    startGuide('welcome', guides.dashboard(), {
      onDestroyed: () => {
        markGuideAsCompleted('welcome');
        // También marcar first-time como completado
        markGuideAsCompleted('first-time');
      }
    }, true);
  }, [startGuide, guides, markGuideAsCompleted]);

  return {
    startGuide,
    guides,
    isGuideCompleted,
    markGuideAsCompleted,
    resetCompletedGuides,
    startFirstTimeGuide,
    triggerWelcomeGuide,
    isNewUser,
    completedGuides
  };
};