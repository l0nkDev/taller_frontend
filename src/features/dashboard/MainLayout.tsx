import { ElementType } from "react";
import { YStack, XStack, Button, Text, ScrollView } from "tamagui";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  ShoppingCart,
  MenuSquare,
  Users,
  Moon,
  User,
  TrendingUp,
} from "@tamagui/lucide-icons";

const SidebarItem = ({
  path,
  icon: Icon,
  label,
}: {
  path: string;
  icon: ElementType;
  label: string;
}) => {
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
          ? "linear-gradient(to bottom right, var(--brandMain), var(--orange500))"
          : "transparent"
      }
      opacity={isActive ? 1 : 0.5}
      hoverStyle={{ backgroundColor: "#FFFFFF0A", opacity: 1 }}
      cursor="pointer"
      onPress={() => navigate(path)}
      style={{ transition: "all 0.15s ease-in-out" }}
    >
      <Icon size={24} color="white" />
      <Text
        color="white"
        fos="$2"
        mt="$2"
        ta="center"
        fontWeight={isActive ? "bold" : "normal"}
      >
        {label}
      </Text>
    </YStack>
  );
};

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <YStack h={"100vh"} bg="saddleBrown">
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
              Gastronomía Artesanal
            </Text>
          </YStack>
        </XStack>
        <XStack ai="center" gap="$4">
          <Button
            size="$3"
            bg="linear-gradient(to right, var(--brandMain), var(--orange500))"
            icon={<TrendingUp size={16} color="white" />}
            bw={0}
          >
            <Text color="white" fos="$3" fontWeight="bold">
              Predicciones IA
            </Text>
          </Button>
          <Button
            size="$3"
            circular
            bg="$amber600"
            bw={0}
            icon={<Moon size={18} color="white" />}
          />
          <Button
            size="$3"
            bg="transparent"
            bw={1}
            boc="$amber200"
            icon={<User size={16} color="white" />}
            onPress={handleLogout}
          >
            <Text color="white" fos="$3">
              Gerente
            </Text>
          </Button>
        </XStack>
      </XStack>
      <XStack f={1}>
        <YStack w={100} px="$2" py="$4" gap="$2">
          <SidebarItem
            path="floorplan"
            icon={LayoutGrid}
            label="Plano de piso"
          />
          <SidebarItem
            path="/orders"
            icon={ShoppingCart}
            label="Órdenes"
          />
          <SidebarItem
            path="/menu"
            icon={MenuSquare}
            label="Menú"
          />
          <SidebarItem
            path="/users"
            icon={Users}
            label="Usuarios"
          />
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
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Outlet />
          </ScrollView>
        </YStack>
      </XStack>
    </YStack>
  );
}
