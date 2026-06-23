import { ElementType, useState } from 'react';
import { YStack, XStack, Button, Text } from 'tamagui';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  ShoppingCart,
  MenuSquare,
  Users,
  LineChart,
  History,
  Menu as MenuIcon,
  X as XIcon,
  LogOut,
} from '@tamagui/lucide-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';

function SidebarItem({
  path,
  icon: Icon,
  label,
  onPress,
}: {
  path: string;
  icon: ElementType;
  label: string;
  onPress?: () => void;
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
      onPress={() => {
        navigate(path);
        if (onPress) onPress();
      }}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <YStack h="100vh" bg="saddleBrown">
      <XStack jc="space-between" ai="center" px="$6" py="$4">
        <XStack ai="center" gap="$3">
          <Button
            size="$3"
            bg="transparent"
            icon={<MenuIcon size={24} color="white" />}
            onPress={() => setIsSidebarOpen(true)}
            display="none"
            $sm={{ display: 'flex' }}
          />
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
            icon={<LogOut size={16} color="white" />}
            onPress={handleLogout}
            hoverStyle={{ backgroundColor: '#FFFFFF0A', opacity: 1 }}
          />
        </XStack>
      </XStack>
      <XStack f={1}>
        <YStack w={100} px="$2" py="$4" gap="$2" display="flex" $sm={{ display: 'none' }}>
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

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.5)"
            zIndex={99999}
            onPress={() => setIsSidebarOpen(false)}
            display="none"
            $sm={{ display: 'flex' }}
          />
          <YStack
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            w={120}
            bg="saddleBrown"
            zIndex={100000}
            px="$2"
            py="$4"
            gap="$2"
            display="none"
            $sm={{ display: 'flex' }}
            shadowColor="#000"
            shadowOffset={{ width: 4, height: 0 }}
            shadowOpacity={0.2}
            shadowRadius={10}
          >
            <XStack jc="flex-end" px="$2" mb="$2">
              <Button
                size="$3"
                bg="transparent"
                icon={<XIcon size={24} color="white" />}
                onPress={() => setIsSidebarOpen(false)}
              />
            </XStack>
            {(!user || user.role === 'admin' || user.role === 'waiter') && (
              <SidebarItem
                path="/floorplan"
                icon={LayoutGrid}
                label="Plano"
                onPress={() => setIsSidebarOpen(false)}
              />
            )}
            {(!user || user.role === 'admin' || user.role === 'kitchen') && (
              <SidebarItem
                path="/orders"
                icon={ShoppingCart}
                label="Órdenes"
                onPress={() => setIsSidebarOpen(false)}
              />
            )}
            {(!user || user.role === 'admin') && (
              <>
                <SidebarItem
                  path="/menu"
                  icon={MenuSquare}
                  label="Menú"
                  onPress={() => setIsSidebarOpen(false)}
                />
                <SidebarItem
                  path="/users"
                  icon={Users}
                  label="Usuarios"
                  onPress={() => setIsSidebarOpen(false)}
                />
                <SidebarItem
                  path="/bi"
                  icon={LineChart}
                  label="Dashboard"
                  onPress={() => setIsSidebarOpen(false)}
                />
                <SidebarItem
                  path="/history"
                  icon={History}
                  label="Historial"
                  onPress={() => setIsSidebarOpen(false)}
                />
              </>
            )}
          </YStack>
        </>
      )}
    </YStack>
  );
}
