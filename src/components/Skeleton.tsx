import { View, styled, GetProps } from 'tamagui';

// 1. Definimos la forma y el color base con Tamagui
const SkeletonBase = styled(View, {
  backgroundColor: '#888888', // Un gris un poco más oscuro para que resalte del fondo
  
  variants: {
    shape: {
      circular: {
        borderRadius: 9999,
      },
      rectangular: {
        borderRadius: '$3',
      },
    },
  } as const,

  defaultVariants: {
    shape: 'rectangular',
  },
});

type SkeletonProps = GetProps<typeof SkeletonBase>;

// 2. Envolvemos el componente para inyectarle la clase CSS pura directamente al DOM
export const Skeleton = (props: SkeletonProps) => {
  return (
    <SkeletonBase 
      {...props} 
      className={`animate-pulse ${props.className || ''}`} 
    />
  );
};