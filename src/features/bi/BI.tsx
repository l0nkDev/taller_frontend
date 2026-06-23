import { useState } from 'react';
import { YStack, XStack, Card, Text, H2, Spinner, View, ScrollView, Button } from 'tamagui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Brush,
  Legend,
} from 'recharts';
import { useGetDashboardStatsQuery, useGetProjectionsQuery } from '../../api/biApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export function BIView() {
  const [timeframe, setTimeframe] = useState<string>('NEXT_WEEK_DAILY');

  const { data: stats, isLoading, isError } = useGetDashboardStatsQuery();
  const { data: projections, isLoading: isLoadingProj } = useGetProjectionsQuery(timeframe);

  if (isLoading)
    return (
      <View f={1} ai="center" jc="center">
        <Spinner size="large" color="$amber500" />
      </View>
    );
  if (isError || !stats)
    return (
      <View f={1} ai="center" jc="center">
        <Text>Error al cargar estadísticas</Text>
      </View>
    );

  return (
    <ScrollView p="$5" f={1} contentContainerStyle={{ pb: 100 }}>
      <YStack gap="$5">
        <H2 fos="$9" color="$primaryText" fontWeight={500}>
          Dashboard
        </H2>
        <XStack gap="$4" flexWrap="wrap">
          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={200}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$3">
              Ingresos Totales
            </Text>
            <Text color="$primaryText" fos="$8" fontWeight="bold">
              Bs. {stats.total_revenue.toFixed(2)}
            </Text>
          </Card>
          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={200}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$3">
              Órdenes Totales
            </Text>
            <Text color="$primaryText" fos="$8" fontWeight="bold">
              {stats.total_orders}
            </Text>
          </Card>
        </XStack>

        <XStack gap="$4" flexWrap="wrap" f={1}>
          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={2}
            minWidth={300}
            minHeight={350}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$4" mb="$4" fontWeight="bold">
              Platos Más Vendidos
            </Text>
            <View f={1} minHeight={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.top_dishes}
                  margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#f59e0b" name="Cantidad Vendida" maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </View>
          </Card>

          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={300}
            minHeight={350}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$4" mb="$4" fontWeight="bold">
              Pisos Más Populares (Ingresos)
            </Text>
            <View f={1} minHeight={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={stats.popular_floors}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {stats.popular_floors?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </View>
          </Card>
        </XStack>

        <XStack gap="$4" flexWrap="wrap" f={1}>
          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={300}
            minHeight={350}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$4" mb="$4" fontWeight="bold">
              Ventas por Día
            </Text>
            <View f={1} minHeight={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.sales_per_day}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    minTickGap={30}
                    tickFormatter={(val) => val.substring(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Ingresos (Bs.)"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Brush
                    dataKey="date"
                    height={30}
                    stroke="#8884d8"
                    tickFormatter={(val) => val.substring(5)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </View>
          </Card>

          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={300}
            minHeight={350}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$4" mb="$4" fontWeight="bold">
              Ventas por Semana
            </Text>
            <View f={1} minHeight={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.sales_per_week}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => val.replace('2026-', '')}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Ingresos (Bs.)" maxBarSize={30} />
                  <Brush
                    dataKey="week"
                    height={30}
                    stroke="#82ca9d"
                    tickFormatter={(val) => val.replace('2026-', '')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </View>
          </Card>

          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={300}
            minHeight={350}
            overflow="hidden"
          >
            <Text color="$secondaryText" fos="$4" mb="$4" fontWeight="bold">
              Ventas por Mes
            </Text>
            <View f={1} minHeight={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.sales_per_month}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" name="Ingresos (Bs.)" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </View>
          </Card>
        </XStack>

        <XStack gap="$4" flexWrap="wrap" f={1}>
          <Card
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            p="$4"
            f={1}
            minWidth={300}
            minHeight={400}
            overflow="hidden"
          >
            <XStack jc="space-between" ai="center" mb="$4" flexWrap="wrap" gap="$3">
              <Text color="$secondaryText" fos="$4" fontWeight="bold">
                Proyecciones
              </Text>
              <XStack gap="$2" bg="$gray3" p="$1" br="$4">
                <Button
                  size="$2"
                  bg={timeframe === 'TOMORROW_HOURLY' ? '$brandMain' : 'transparent'}
                  color={timeframe === 'TOMORROW_HOURLY' ? 'white' : '$primaryText'}
                  onPress={() => setTimeframe('TOMORROW_HOURLY')}
                >
                  Mañana (Por Hora)
                </Button>
                <Button
                  size="$2"
                  bg={timeframe === 'NEXT_WEEK_DAILY' ? '$brandMain' : 'transparent'}
                  color={timeframe === 'NEXT_WEEK_DAILY' ? 'white' : '$primaryText'}
                  onPress={() => setTimeframe('NEXT_WEEK_DAILY')}
                >
                  Próxima Semana
                </Button>
                <Button
                  size="$2"
                  bg={timeframe === 'NEXT_MONTH_DAILY' ? '$brandMain' : 'transparent'}
                  color={timeframe === 'NEXT_MONTH_DAILY' ? 'white' : '$primaryText'}
                  onPress={() => setTimeframe('NEXT_MONTH_DAILY')}
                >
                  Próximo Mes
                </Button>
              </XStack>
            </XStack>
            {isLoadingProj ? (
              <View f={1} ai="center" jc="center">
                <Spinner size="large" color="$amber500" />
              </View>
            ) : projections?.success ? (
              <View f={1} minHeight={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={projections.projections}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) =>
                        timeframe === 'TOMORROW_HOURLY' ? val.substring(11, 16) : val.substring(5)
                      }
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="expected_revenue"
                      stroke="#f59e0b"
                      fill="#fef3c7"
                      name="Ingresos Esperados (Bs.)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </View>
            ) : (
              <View f={1} ai="center" jc="center" p="$4">
                <Text color="$red10" ta="center">
                  {projections?.message || 'Error al cargar proyecciones'}
                </Text>
              </View>
            )}
          </Card>
        </XStack>

        {/* AI Recommendations */}
        <XStack gap="$4" flexWrap="wrap" mt="$4">
          <Card bw={2} boc="$cardBorder" bg="$cardBg" br="$6" p="$4" f={1} overflow="hidden">
            <XStack jc="space-between" ai="center" mb="$4">
              <Text color="$secondaryText" fos="$4" fontWeight="bold">
                Recomendaciones de IA (Descuentos)
              </Text>
            </XStack>

            {!stats.discount_recommendations || stats.discount_recommendations.length === 0 ? (
              <View p="$4" ai="center" jc="center" bg="$gray2" br="$4" bw={1} boc="$gray4">
                <Text color="$gray500" ta="center">
                  No hay recomendaciones actuales. Se requiere que un plato tenga un margen de
                  ganancia &gt; 50% y proyección de ventas baja, o el modelo necesita más historial
                  de ventas (mínimo 3 días).
                </Text>
              </View>
            ) : (
              <YStack gap="$4">
                {stats.discount_recommendations.map((rec) => (
                  <XStack
                    key={rec.dish_id}
                    p="$3"
                    bg="$gray2"
                    br="$4"
                    bw={1}
                    boc="$gray4"
                    jc="space-between"
                    ai="center"
                  >
                    <YStack f={1} mr="$3">
                      <Text fontWeight="bold" fos="$5" mb="$1">
                        {rec.dish_name}
                      </Text>
                      <Text color="$gray500" fos="$3">
                        Tu producto cuesta el {100 - Math.round(rec.margin_percentage * 100)}% de su
                        precio de venta. Puedes rebajarlo para aumentar la demanda.
                      </Text>
                    </YStack>
                    <YStack ai="flex-end" gap="$2">
                      <Text
                        bg="$green100"
                        col="$green700"
                        px="$2"
                        py="$1"
                        br="$3"
                        fos="$2"
                        fow="bold"
                      >
                        Margen: {Math.round(rec.margin_percentage * 100)}%
                      </Text>
                      <Text
                        bg="$amber100"
                        col="$amber700"
                        px="$2"
                        py="$1"
                        br="$3"
                        fos="$2"
                        fow="bold"
                      >
                        Predicción: {rec.predicted_sales_next_week} unid.
                      </Text>
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            )}
          </Card>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
