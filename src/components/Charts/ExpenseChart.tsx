import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Transaccion, Categoria } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ExpenseChartProps {
  transacciones: Transaccion[];
  categorias: Categoria[];
}

export function ExpenseChart({ transacciones, categorias }: ExpenseChartProps) {
  const { t } = useTranslation();
  const gastos = transacciones.filter(t => t.tipo === 'gasto');

  const gastoPorCategoria = categorias
    .filter(c => c.tipo === 'gasto')
    .map(categoria => {
      const total = gastos
        .filter(t => t.categoria_id === categoria.id)
        .reduce((sum, t) => sum + t.monto, 0);

      return {
        name: categoria.nombre,
        value: total,
        itemStyle: { color: categoria.color }
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Configuración responsive para el gráfico
  const getResponsiveOption = () => {
    const isSmallScreen = window.innerWidth < 640;
    const isMediumScreen = window.innerWidth < 1024;
    const isXLScreen = window.innerWidth >= 1280;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const formatted = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(params.value);
          return `${params.name}: ${formatted} (${params.percent}%)`;
        }
      },
      legend: {
        orient: isXLScreen ? 'vertical' : 'horizontal',
        left: isXLScreen ? 'left' : 'center',
        top: isXLScreen ? 'middle' : 'bottom',
        textStyle: {
          fontSize: isSmallScreen ? 10 : isXLScreen ? 11 : 12
        },
        itemWidth: isSmallScreen ? 12 : isXLScreen ? 18 : 20,
        itemHeight: isSmallScreen ? 8 : isXLScreen ? 12 : 14,
        padding: isXLScreen ? [0, 0, 0, 10] : [10, 0, 0, 0]
      },
      series: [
        {
          name: 'Gastos por Categoría',
          type: 'pie',
          radius: isSmallScreen ? ['35%', '65%'] : isXLScreen ? ['30%', '55%'] : ['40%', '70%'],
          center: isSmallScreen ? ['50%', '40%'] : isXLScreen ? ['60%', '45%'] : ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: isSmallScreen ? 4 : isXLScreen ? 6 : 8,
            borderColor: '#fff',
            borderWidth: isSmallScreen ? 1 : 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: isSmallScreen ? 14 : isXLScreen ? 16 : 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: gastoPorCategoria
        }
      ]
    };
  };

  return (
    <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 xl:p-8 h-fit hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-6 xl:mb-8">
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{t('dashboard.distribucionGastos')}</h3>
        {gastoPorCategoria.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-3 py-1 rounded-full">
            {gastoPorCategoria.length} {t('dashboard.categoriasActivas')}
          </span>
        )}
      </div>

      {gastoPorCategoria.length > 0 ? (
        <div className="w-full overflow-hidden">
          <ReactECharts
            option={getResponsiveOption()}
            style={{
              height: window.innerWidth < 640 ? '280px' : window.innerWidth >= 1280 ? '320px' : '300px',
              width: '100%',
              minWidth: 0
            }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-light">No hay datos de gastos para mostrar</p>
        </div>
      )}
    </div>
  );
}
