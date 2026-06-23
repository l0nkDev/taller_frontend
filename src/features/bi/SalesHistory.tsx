import { useState } from 'react';
import { YStack, XStack, Card, Text, H2, Spinner, View, Button, Input, ScrollView } from 'tamagui';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import { useGetSalesHistoryQuery } from '../../api/biApi';
import { useGetCategoriesQuery } from '../../api/dishesApi';

export function SalesHistoryView() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dishName, setDishName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [queryArgs, setQueryArgs] = useState<{
    start_date?: string;
    end_date?: string;
    dish_name?: string;
    category_id?: number;
    page: number;
    page_size: number;
  }>({ page: 1, page_size: 20 });

  const { data: historyData, isLoading, isFetching, isError } = useGetSalesHistoryQuery(queryArgs);
  const { data: categories } = useGetCategoriesQuery();

  const handleFilter = () => {
    setPage(1);
    setQueryArgs({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      dish_name: dishName || undefined,
      category_id: categoryId === 'all' ? undefined : Number(categoryId),
      page: 1,
      page_size: pageSize,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQueryArgs((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <YStack p="$5" f={1} gap="$5">
      <H2 fos="$9" color="$primaryText" fontWeight={500}>
        Historial de Ventas
      </H2>

      <Card bw={1} boc="$cardBorder" bg="$cardBg" p="$4">
        <XStack gap="$4" flexWrap="wrap" ai="flex-end">
          <YStack minWidth={150}>
            <Text fos="$2" color="$secondaryText" mb="$1">
              Fecha Inicio
            </Text>
            <Input
              size="$3"
              type="date"
              value={startDate}
              onChangeText={setStartDate}
              onChange={(e: any) => setStartDate(e.target.value)}
            />
          </YStack>
          <YStack minWidth={150}>
            <Text fos="$2" color="$secondaryText" mb="$1">
              Fecha Fin
            </Text>
            <Input
              size="$3"
              type="date"
              value={endDate}
              onChangeText={setEndDate}
              onChange={(e: any) => setEndDate(e.target.value)}
            />
          </YStack>
          <YStack minWidth={150}>
            <Text fos="$2" color="$secondaryText" mb="$1">
              Plato (Buscar)
            </Text>
            <Input
              size="$3"
              placeholder="Ej: Majadito"
              value={dishName}
              onChangeText={setDishName}
            />
          </YStack>
          <YStack minWidth={150}>
            <Text fos="$2" color="$secondaryText" mb="$1">
              Categoría
            </Text>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                height: 44,
                borderRadius: 8,
                borderColor: '#ccc',
                padding: '0 10px',
                fontSize: 14,
              }}
            >
              <option value="all">Todas</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </YStack>
          <Button size="$3" bg="$brandMain" color="white" onPress={handleFilter}>
            Aplicar Filtros
          </Button>
        </XStack>
      </Card>

      <Card bw={1} boc="$cardBorder" bg="$cardBg" f={1} overflow="hidden">
        {isLoading || isFetching ? (
          <View f={1} ai="center" jc="center">
            <Spinner size="large" color="$amber500" />
          </View>
        ) : isError ? (
          <View f={1} ai="center" jc="center">
            <Text>Error al cargar el historial</Text>
          </View>
        ) : (
          <YStack f={1}>
            <XStack bg="$gray3" p="$3" borderBottomWidth={1} boc="$cardBorder" ai="center">
              <Text f={1} fontWeight="bold" fos="$3">
                Fecha
              </Text>
              <Text f={1} fontWeight="bold" fos="$3">
                Orden #
              </Text>
              <Text f={3} fontWeight="bold" fos="$3">
                Ítems
              </Text>
              <Text f={1} fontWeight="bold" fos="$3">
                Método
              </Text>
              <Text f={1} fontWeight="bold" fos="$3" ta="right">
                Total (Bs.)
              </Text>
            </XStack>

            <ScrollView f={1}>
              {historyData?.items.map((item, index) => (
                <YStack
                  key={item.order_id}
                  borderBottomWidth={index === historyData.items.length - 1 ? 0 : 1}
                  boc="$cardBorder"
                >
                  <XStack p="$3" ai="center" hoverStyle={{ bg: '$gray2' }}>
                    <Text f={1} fos="$3">
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                    <Text f={1} fos="$3" color="$secondaryText">
                      #{item.order_id}
                    </Text>
                    <YStack f={3}>
                      {item.dish_names.map((dish, i) => (
                        <Text key={i} fos="$3" color="$secondaryText">
                          • {dish}
                        </Text>
                      ))}
                    </YStack>
                    <Text f={1} fos="$3">
                      {item.method === 'C' ? 'Efectivo' : 'QR'}
                    </Text>
                    <Text f={1} fos="$4" fontWeight="bold" color="$green600" ta="right">
                      {item.total.toFixed(2)}
                    </Text>
                  </XStack>
                </YStack>
              ))}
              {historyData?.items.length === 0 && (
                <View p="$6" ai="center">
                  <Text color="$secondaryText">
                    No se encontraron ventas para los filtros seleccionados.
                  </Text>
                </View>
              )}
            </ScrollView>

            {historyData && historyData.total_pages > 1 && (
              <XStack
                p="$3"
                ai="center"
                jc="space-between"
                borderTopWidth={1}
                boc="$cardBorder"
                bg="$gray2"
              >
                <Text fos="$3" color="$secondaryText">
                  Mostrando página {historyData.current_page} de {historyData.total_pages} (Total:{' '}
                  {historyData.total_items})
                </Text>
                <XStack gap="$2">
                  <Button
                    size="$3"
                    disabled={page === 1}
                    onPress={() => handlePageChange(page - 1)}
                    icon={ChevronLeft}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="$3"
                    disabled={page === historyData.total_pages}
                    onPress={() => handlePageChange(page + 1)}
                    iconAfter={ChevronRight}
                  >
                    Siguiente
                  </Button>
                </XStack>
              </XStack>
            )}
          </YStack>
        )}
      </Card>
    </YStack>
  );
}
