import { Tabs, H2, YStack, XStack, Button, Text } from 'tamagui';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/index';
import { useNavigate } from 'react-router-dom';

const PedidosView = () => <Text>Vista de Gestión de Pedidos Activos</Text>;
const AsistenteView = () => <Text>Vista del Chat de Asistente IA</Text>;
const BIView = () => <Text>Vista de Gráficos y Reportes</Text>;

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
<YStack f={1} bg="$background" p="$4" gap="$4">
  <XStack jc="space-between" ai="center" pb="$4" borderBottomWidth={1} borderColor="$borderColor">
    <H2 size="$8" color="$blue10">Sistema de Gestión</H2>
    <Button size="$3" theme="alt1" onPress={handleLogout}>Cerrar Sesión</Button>
  </XStack>

  <Tabs defaultValue="pedidos" orientation="horizontal" f={1} flexDirection="column">
    <Tabs.List mb="$4" gap="$2">
      <Tabs.Tab value="pedidos" f={1} theme="active">
        <Text fontWeight="bold">Pedidos</Text>
      </Tabs.Tab>
      
    </Tabs.List>

    <Tabs.Content value="pedidos" f={1} p="$4" bg="$backgroundHover" br="$4" bw={1} bc="$borderColor">
      <PedidosView />
    </Tabs.Content>
        
        <Tabs.Content value="ia" f={1} p="$4" bg="$backgroundHover" br="$4" bw={1} bc="$borderColor">
          <AsistenteView />
        </Tabs.Content>
        
        <Tabs.Content value="bi" f={1} p="$4" bg="$backgroundHover" br="$4" bw={1} bc="$borderColor">
          <BIView />
        </Tabs.Content>
        
      </Tabs>
    </YStack>
  );
}