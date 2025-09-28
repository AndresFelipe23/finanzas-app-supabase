export interface User {
  id: string;
  email: string;
  nombre: string;
  foto_perfil?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  ocupacion?: string | null;
  biografia?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Cuenta {
  id: string;
  usuario_id: string;
  nombre: string;
  saldo: number;
  tipo: 'efectivo' | 'ahorro' | 'credito' | 'inversion';
  descripcion?: string;
  banco?: string;
  numero_cuenta?: string;
  limite_credito?: number;
  interes?: number;
  fecha_vencimiento?: string;
  activa: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateCuentaDto {
  nombre: string;
  tipo: 'efectivo' | 'ahorro' | 'credito' | 'inversion';
  saldo?: number;
  descripcion?: string;
  banco?: string;
  numero_cuenta?: string;
  limite_credito?: number;
  interes?: number;
  fecha_vencimiento?: string;
}

export interface UpdateCuentaDto extends Partial<CreateCuentaDto> {
  activa?: boolean;
}

export interface Categoria {
  id: string;
  usuario_id: string;
  nombre: string;
  icono: string;
  color: string;
  tipo: 'ingreso' | 'gasto';
  descripcion?: string;
}

export interface CreateCategoriaDto {
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  color: string;
  icono: string;
  descripcion?: string;
}

export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
  id: string;
}

export interface Transaccion {
  id: string;
  usuario_id: string;
  cuenta_id: string;
  categoria_id: string;
  nombre: string;
  monto: number;
  descripcion: string;
  fecha: string;
  tipo: 'ingreso' | 'gasto';
  es_recurrente: boolean;
  created_at: string;
}

export interface Presupuesto {
  id: string;
  usuario_id: string;
  categoria_id: string;
  limite: number;
  mes: number;
  ano: number;
  created_at: string;
  updated_at?: string;
}

export interface CreatePresupuestoDto {
  categoria_id: string;
  limite: number;
  mes: number;
  ano: number;
}

export interface UpdatePresupuestoDto extends Partial<CreatePresupuestoDto> {}

export interface PresupuestoConProgreso extends Presupuesto {
  categoria: Categoria;
  gastado: number;
  porcentaje_usado: number;
  restante: number;
  estado: 'dentro_presupuesto' | 'cerca_limite' | 'excedido';
}

export interface Meta {
  id: string;
  usuario_id: string;
  nombre: string;
  descripcion?: string;
  cantidad_objetivo: number;
  cantidad_actual: number;
  fecha_limite: string;
  categoria?: string;
  icono?: string;
  color?: string;
  es_completada: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateMetaDto {
  nombre: string;
  descripcion?: string;
  cantidad_objetivo: number;
  fecha_limite: string;
  categoria?: string;
  icono?: string;
  color?: string;
}

export interface UpdateMetaDto extends Partial<CreateMetaDto> {
  cantidad_actual?: number;
  es_completada?: boolean;
}

export interface MetaConProgreso extends Meta {
  porcentaje_completado: number;
  tiempo_restante_dias: number;
  dinero_restante: number;
  progreso_diario_requerido: number;
  estado: 'en_tiempo' | 'atrasada' | 'completada' | 'vencida';
}

export interface FiltroTransacciones {
  fechaInicio?: string;
  fechaFin?: string;
  categoria?: string;
  cuenta?: string;
  tipo?: 'ingreso' | 'gasto' | 'todos';
  busqueda?: string;
}

export interface FiltroReporte {
  fechaInicio: string;
  fechaFin: string;
  categorias?: string[];
  cuentas?: string[];
  tipo?: 'ingreso' | 'gasto' | 'todos';
  periodo?: 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'personalizado';
}

export interface EstadisticaReporte {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  transacciones: number;
  promedioGastosDiario: number;
  categoriaTopGasto: {
    nombre: string;
    monto: number;
    porcentaje: number;
  } | null;
  categoriaTopIngreso: {
    nombre: string;
    monto: number;
    porcentaje: number;
  } | null;
}

export interface DatoGrafico {
  fecha: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface DatoCategoria {
  id: string;
  nombre: string;
  color: string;
  icono: string;
  monto: number;
  porcentaje: number;
  transacciones: number;
}

export interface ResumenPeriodo {
  periodo: string;
  ingresos: number;
  gastos: number;
  balance: number;
  transacciones: number;
}

export interface ReporteCompleto {
  filtros: FiltroReporte;
  estadisticas: EstadisticaReporte;
  datosGraficos: DatoGrafico[];
  categorias: {
    ingresos: DatoCategoria[];
    gastos: DatoCategoria[];
  };
  resumenPeriodos: ResumenPeriodo[];
  evoluciones: {
    ingresosMensuales: Array<{ mes: string; monto: number }>;
    gastosMensuales: Array<{ mes: string; monto: number }>;
    balanceMensual: Array<{ mes: string; monto: number }>;
  };
}
