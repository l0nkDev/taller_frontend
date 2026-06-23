import { ElementType } from 'react';
import { YStack, XStack, Button, Text } from 'tamagui';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  ShoppingCart,
  MenuSquare,
  Users,
  User,
  LineChart,
  History,
} from '@tamagui/lucide-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';

function SidebarItem({
  path,
  icon: Icon,
  label,
}: {
  path: string;
  icon: ElementType;
  label: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);
  return (
    <YStack
      ai="center"
      jc="center"
      p="$3"
      br="$4"
      backgroundImage={
        isActive
          ? 'linear-gradient(to bottom right, var(--brandMain), var(--orange500))'
          : 'transparent'
      }
      opacity={isActive ? 1 : 0.5}
      hoverStyle={{ backgroundColor: '#FFFFFF0A', opacity: 1 }}
      cursor="pointer"
      onPress={() => navigate(path)}
      style={{ transition: 'all 0.15s ease-in-out' }}
    >
      <Icon size={24} color="white" />
      <Text color="white" fos="$2" mt="$2" ta="center" fontWeight={isActive ? 'bold' : 'normal'}>
        {label}
      </Text>
    </YStack>
  );
}

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <YStack h="100vh" bg="saddleBrown">
      <XStack jc="space-between" ai="center" px="$6" py="$4">
        <XStack ai="center" gap="$3">
          <YStack
            w={40}
            h={40}
            br="$3"
            jc="center"
            ai="center"
            backgroundImage="linear-gradient(to bottom right, var(--brandMain), var(--orange500))"
          >
            <Text fos="$5">🍽️</Text>
          </YStack>
          <YStack>
            <Text fos="$5" color="white" fontWeight="bold">
              Tu Café - Cotoca
            </Text>
            <Text fos="$2" color="$amber200">
              Comida típica
            </Text>
          </YStack>
        </XStack>
        <XStack ai="center" gap="$4">
          <Button
            size="$3"
            bg="transparent"
            bw={1}
            boc="$amber200"
            icon={<User size={16} color="white" />}
            onPress={handleLogout}
          >
            <Text color="white" fos="$3">
              Cerrar Sesión
            </Text>
          </Button>
        </XStack>
      </XStack>
      <XStack f={1}>
        <YStack w={100} px="$2" py="$4" gap="$2">
          {(!user || user.role === 'admin' || user.role === 'waiter') && (
            <SidebarItem path="/floorplan" icon={LayoutGrid} label="Plano de piso" />
          )}
          {(!user || user.role === 'admin' || user.role === 'kitchen') && (
            <SidebarItem path="/orders" icon={ShoppingCart} label="Órdenes" />
          )}
          {(!user || user.role === 'admin') && (
            <>
              <SidebarItem path="/menu" icon={MenuSquare} label="Menú" />
              <SidebarItem path="/users" icon={Users} label="Usuarios" />
              <SidebarItem path="/bi" icon={LineChart} label="Dashboard" />
              <SidebarItem path="/history" icon={History} label="Historial" />
            </>
          )}
          <YStack f={1} />
        </YStack>
        <YStack
          f={1}
          bg="$bgGradientStart"
          borderTopLeftRadius="$8"
          shadowColor="#000"
          shadowOffset={{ width: -2, height: -2 }}
          shadowOpacity={0.1}
          shadowRadius={10}
          overflow="hidden"
        >
          <Outlet />
        </YStack>
      </XStack>
    </YStack>
  );
}
