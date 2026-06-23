import { YStack, XStack, Card, H2, H4, Text, ScrollView, View, Button } from 'tamagui';
import {
  Receipt,
  Clock,
  ChefHat,
  CheckCircle,
  ShoppingCart,
  RefreshCcw,
} from '@tamagui/lucide-icons';
import { useGetActiveOrdersQuery, useUpdateOrderDetailMutation } from '../../api/orderApi';
import { Skeleton } from '../../components/Skeleton';

const statusMap: Record<string, { name: string; color: string }> = {
  T: { name: 'TOMADO', color: '$cyan500' },
  K: { name: 'ESPERANDO', color: '$blue500' },
  C: { name: 'COCINANDO', color: '$amber500' },
  R: { name: 'LISTO', color: '$green500' },
  S: { name: 'ENTREGADO', color: '$green700' },
  X: { name: 'CANCELADO', color: '$gray600' },
};

export function PlaceholderOrder() {
  return (
    <Card
      mah="40vh"
      w="100%"
      $gtSm={{ w: 'calc(50% - 15px)' }}
      $gtMd={{ w: 'calc(33.333% - 20px)' }}
      $gtLg={{ w: 'calc(25% - 20px)' }}
      bw={2}
      boc="$cardBorder"
      bg="$cardBg"
      br="$5"
      animation="quick"
      hoverStyle={{ borderColor: '$brandMain' }}
    >
      <XStack p="$3" bg="$amber100" jc="space-between" ai="center" btrr="$5" btlr="$5">
        <Skeleton height={20} width={120} />
        <Skeleton height={16} width={80} />
      </XStack>
      <YStack p="$4" gap="$3">
        <YStack p="$3" bw={1} boc="$gray4" br="$4" bg="$gray1" gap="$3">
          <XStack jc="space-between" ai="center">
            <XStack gap="$3" ai="center" f={1}>
              <Skeleton height={16} width={140} />
            </XStack>
          </XStack>

          <XStack jc="space-between" ai="center" gap="$2">
            <Skeleton height={28} width="100%" />
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}

function ErrorScreen({ refresh }: { refresh: () => void }) {
  return (
    <View f={1} ai="center" jc="center">
      <YStack ai="center" gap={16}>
        <View ai="center" jc="center" w={128} h={128} bc="$amber700" br={64}>
          <ShoppingCart col="$white" size={64} />
        </View>
        <Text fos={24} fow={900}>
          Error al cargar el plano.
        </Text>
        <Button icon={<RefreshCcw />} onPress={() => refresh()}>
          Recargar
        </Button>
      </YStack>
    </View>
  );
}

export function OrdersView() {
  const { data: activeOrders, isFetching, isError, refetch } = useGetActiveOrdersQuery();
  const [updateOrderDetail, { isLoading: isUpdating }] = useUpdateOrderDetailMutation();

  // Filtramos las órdenes para mostrar solo las que tienen platos pendientes en cocina
  const visibleOrders =
    activeOrders?.filter((order) =>
      order.detail.some((d) => d.status !== 'S' && d.status !== 'X'),
    ) || [];

  const renderContent = () => {
    if (activeOrders && visibleOrders.length === 0) {
      return (
        <View f={1} ai="center" jc="center" py="$10" w="100%">
          <Receipt size={48} color="$gray8" mb="$3" />
          <Text color="$gray9" fos="$5">
            No hay comandas pendientes en cocina.
          </Text>
        </View>
      );
    }
    if (isFetching) {
      return (
        <>
          <PlaceholderOrder />
          <PlaceholderOrder />
          <PlaceholderOrder />
          <PlaceholderOrder />
          <PlaceholderOrder />
        </>
      );
    }
    return visibleOrders.map((order) => {
      const pendingDetails = order.detail.filter((d) => d.status !== 'S' && d.status !== 'X');

      if (pendingDetails.length === 0) return null;

      return (
        <Card
          key={order.id}
          mah="40vh"
          w="100%"
          $gtSm={{ w: 'calc(50% - 15px)' }}
          $gtMd={{ w: 'calc(33.333% - 20px)' }}
          $gtLg={{ w: 'calc(25% - 20px)' }}
          bw={2}
          boc="$cardBorder"
          bg="$cardBg"
          br="$5"
          animation="quick"
          hoverStyle={{ borderColor: '$brandMain' }}
        >
          <XStack p="$3" bg="$amber100" jc="space-between" ai="center" btrr="$5" btlr="$5">
            <H4 color="$amber900" m={0}>
              Grupo {order.tablegroup_id}
            </H4>
            <Text fontWeight="bold" color="$amber900">
              Orden #{order.id}
            </Text>
          </XStack>
          <ScrollView showsVerticalScrollIndicator={false} f={1}>
            <YStack p="$4" gap="$3">
              {pendingDetails.map((item) => {
                const isTaken = item.status === 'T';
                const isCooking = item.status === 'C';
                const isReady = item.status === 'R';

                return (
                  <YStack
                    key={item.id}
                    p="$3"
                    bw={1}
                    boc="$gray4"
                    br="$4"
                    bg={isReady ? '$green1' : '$gray1'}
                    gap="$3"
                  >
                    {/* Detalles del Platillo */}
                    <XStack jc="space-between" ai="center">
                      <XStack gap="$3" ai="center" f={1}>
                        <View bg="$gray4" px="$2" py="$1" br="$3">
                          <Text fontWeight="bold" fos="$5">
                            {item.quantity}x
                          </Text>
                        </View>
                        <Text f={1} fos="$5" fontWeight="600">
                          {item.dish_name}
                        </Text>
                      </XStack>
                    </XStack>

                    {/* Control de Estados e Interfaz de Acción */}
                    <XStack jc="space-between" ai="center" gap="$2">
                      <Text
                        px={8}
                        py={4}
                        bg={statusMap[item.status]?.color || '#888'}
                        color="white"
                        fos={12}
                        fontWeight="900"
                        br={5}
                      >
                        {statusMap[item.status]?.name || item.status}
                      </Text>

                      {/* FLUJO DE BOTONES CORREGIDO */}
                      {isTaken && (
                        <Button
                          size="$2"
                          bg="$amber500"
                          hoverStyle={{ backgroundColor: '$amber600' }}
                          disabled={isUpdating}
                          icon={<ChefHat size={14} color="white" />}
                          onPress={() =>
                            updateOrderDetail({
                              detail_id: item.id,
                              status: 'C',
                            })
                          }
                        >
                          <Text color="white" fontWeight="bold">
                            Preparar
                          </Text>
                        </Button>
                      )}

                      {isCooking && (
                        <Button
                          size="$2"
                          bg="$green500"
                          hoverStyle={{ backgroundColor: '$green600' }}
                          disabled={isUpdating}
                          icon={<CheckCircle size={14} color="white" />}
                          onPress={() =>
                            updateOrderDetail({
                              detail_id: item.id,
                              status: 'R',
                            })
                          }
                        >
                          <Text color="white" fontWeight="bold">
                            Marcar Listo
                          </Text>
                        </Button>
                      )}

                      {isReady && (
                        <Text color="$gray9" fos={12} fontWeight="bold" fontStyle="italic">
                          Esperando al mesero...
                        </Text>
                      )}
                    </XStack>
                  </YStack>
                );
              })}
            </YStack>
          </ScrollView>
        </Card>
      );
    });
  };

  return (
    <YStack p="$5" f={1} overflow="hidden">
      <XStack jc="space-between" ai="center" mb="$6">
        <YStack>
          <H2 fos="$9" color="$primaryText" fontWeight={500}>
            Monitor de Cocina
          </H2>
          <Text fos="$5" color="$secondaryText" mt="$2">
            Supervisa y actualiza el estado de los platillos en tiempo real
          </Text>
        </YStack>
        <Card p="$3" bg="$cardBg" bw={1} boc="$cardBorder" br="$4">
          <XStack gap="$2" ai="center">
            <Clock size={20} color="$amber500" />
            <Text fontWeight="bold" fos="$5">
              {visibleOrders.length} Comandas activas
            </Text>
          </XStack>
        </Card>
      </XStack>
      {isError && !isFetching ? (
        <ErrorScreen refresh={refetch} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} f={1}>
          <XStack flexWrap="wrap" gap="$5" pb="$10">
            {renderContent()}
          </XStack>
        </ScrollView>
      )}
    </YStack>
  );
}
