import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  iconName?: string;
  className?: string;
  size?: number;
}

export function IconRenderer({ iconName = 'Tag', className = '', size = 20 }: IconRendererProps) {
  // Obtener el componente del icono dinámicamente
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Tag;

  return <IconComponent className={className} size={size} />;
}