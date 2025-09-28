# 💰 Financially

> **Tu aplicación personal de gestión financiera inteligente**

Financially es una aplicación web moderna y completa para la gestión de finanzas personales, diseñada para ayudarte a tomar control total de tu dinero, establecer metas de ahorro y alcanzar la libertad financiera.

![Financially Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 🌟 Características Principales

### 📊 **Dashboard Inteligente**
- Vista general de tu situación financiera
- Métricas en tiempo real de ingresos y gastos
- Gráficos interactivos de distribución de gastos
- Resumen de presupuestos y metas de ahorro

### 💳 **Gestión de Transacciones**
- Registro fácil de ingresos y gastos
- Categorización automática de transacciones
- Búsqueda y filtrado avanzado
- Historial completo de movimientos

### 🏦 **Administración de Cuentas**
- Múltiples cuentas bancarias y de efectivo
- Seguimiento de saldos en tiempo real
- Transferencias entre cuentas
- Ocultar/mostrar saldos para privacidad

### 🏷️ **Sistema de Categorías**
- Categorías personalizables para ingresos y gastos
- Iconos y colores personalizados
- Estadísticas por categoría
- Análisis de patrones de gasto

### 📈 **Presupuestos Inteligentes**
- Creación de presupuestos por categoría
- Alertas cuando te acercas al límite
- Seguimiento de progreso mensual
- Recomendaciones de ajuste automático

### 🎯 **Metas de Ahorro**
- Establecimiento de objetivos financieros
- Seguimiento de progreso hacia metas
- Recomendaciones diarias de ahorro
- Celebración de logros alcanzados

### 📊 **Reportes Detallados**
- Análisis de evolución temporal
- Reportes por período personalizable
- Exportación de datos
- Gráficos de salud financiera

### ⚙️ **Configuración Personalizada**
- Perfil de usuario completo
- Configuración de tema (claro/oscuro)
- Soporte multiidioma (Español/Inglés)
- Configuración de privacidad

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 18.2.0** - Framework principal
- **TypeScript 5.0.0** - Tipado estático
- **Tailwind CSS** - Estilos y diseño responsivo
- **Framer Motion** - Animaciones fluidas
- **React Router DOM** - Navegación
- **Lucide React** - Iconografía moderna

### **Backend & Base de Datos**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad de datos
- **Supabase Storage** - Almacenamiento de archivos

### **Herramientas de Desarrollo**
- **Vite** - Build tool y dev server
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Git** - Control de versiones

## 📦 Instalación

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/financially.git
cd financially
```

### **2. Instalar Dependencias**
```bash
npm install
# o
yarn install
```

### **3. Configurar Variables de Entorno**
Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### **4. Configurar Supabase**
1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL en la carpeta `supabase/migrations/`
3. Configura las políticas RLS para seguridad
4. Habilita el bucket de almacenamiento para avatares

### **5. Ejecutar en Desarrollo**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🗄️ Estructura de la Base de Datos

### **Tablas Principales**
- `usuarios` - Información de usuarios
- `cuentas` - Cuentas bancarias y de efectivo
- `categorias` - Categorías de ingresos y gastos
- `transacciones` - Movimientos financieros
- `presupuestos` - Presupuestos mensuales
- `metas` - Objetivos de ahorro

### **Relaciones**
- Usuarios → Cuentas (1:N)
- Usuarios → Categorías (1:N)
- Usuarios → Transacciones (1:N)
- Usuarios → Presupuestos (1:N)
- Usuarios → Metas (1:N)

## 🎨 Características de Diseño

### **Modo Oscuro/Claro**
- Cambio automático según preferencias del sistema
- Toggle manual en configuración
- Persistencia de preferencias

### **Diseño Responsivo**
- Optimizado para móviles, tablets y desktop
- Navegación adaptativa
- Componentes escalables

### **Accesibilidad**
- Navegación por teclado
- Contraste adecuado
- Textos descriptivos

## 🌍 Internacionalización

### **Idiomas Soportados**
- 🇪🇸 **Español** (predeterminado)
- 🇺🇸 **Inglés**

### **Cambio de Idioma**
- Selector en configuración
- Persistencia de preferencias
- Traducción completa de la interfaz

## 🔒 Seguridad

### **Autenticación**
- Registro con email y contraseña
- Autenticación segura con Supabase Auth
- Sesiones persistentes

### **Protección de Datos**
- Row Level Security (RLS) en todas las tablas
- Encriptación de datos sensibles
- Políticas de acceso por usuario

### **Privacidad**
- Datos almacenados localmente en Supabase
- Sin terceros para análisis
- Control total de información personal

## 📱 Funcionalidades Móviles

### **Optimización Mobile**
- Interfaz táctil optimizada
- Navegación por gestos
- Componentes adaptativos
- Carga rápida en redes lentas

### **PWA Ready**
- Instalable como app nativa
- Funcionamiento offline básico
- Notificaciones push (próximamente)

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contribuir

### **Cómo Contribuir**
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Estándares de Código**
- Usar TypeScript estricto
- Seguir convenciones de React
- Escribir tests para nuevas funcionalidades
- Documentar cambios importantes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el excelente backend
- [Tailwind CSS](https://tailwindcss.com) por el sistema de diseño
- [Lucide](https://lucide.dev) por los iconos
- [Framer Motion](https://framer.com/motion/) por las animaciones

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 **Email**: soporte@financially.app
- 💬 **Discord**: [Servidor de la Comunidad](https://discord.gg/financially)
- 📖 **Documentación**: [docs.financially.app](https://docs.financially.app)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/financially/issues)

---

<div align="center">

**⭐ Si te gusta Financially, ¡dale una estrella al proyecto! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/tu-usuario/financially?style=social)](https://github.com/tu-usuario/financially)
[![GitHub forks](https://img.shields.io/github/forks/tu-usuario/financially?style=social)](https://github.com/tu-usuario/financially)

*Hecho con ❤️ para tu libertad financiera*

</div>
