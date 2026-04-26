import { YStack, XStack, Text, H2, Button, ScrollView } from "tamagui";
import { useGetCategoriesQuery, useGetDishesQuery } from "../../api/dishesApi";
import { useState } from "react";
import { MenuDialog } from "./components/MenuDialog";
import { CategoryDialog } from "./components/CategoryDialog";

export function MenuView() {
  const { data: dishes } = useGetDishesQuery();
  const { data: categories } = useGetCategoriesQuery();
  const [filter, setFilter] = useState(0);

  return (
    <YStack p="$5">
      <XStack f={1} jc={"space-between"}>
        <YStack mb="$6">
          <H2 fos="$9" color="$primaryText" fontWeight={500}>
            Gestión de Menú
          </H2>
          <Text fos="$5" color="$secondaryText" mt="$2">
            Administra el menú del restaurante.
          </Text>
        </YStack>
        <MenuDialog editing={null} />
      </XStack>

      <ScrollView showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" mb="$5" flexWrap="wrap">
          {categories && (
            <Button
              onPress={() => setFilter(0)}
              p="$4"
              bw={2}
              boc={filter === 0 ? "saddleBrown" : "$cardBorder"}
              bg={filter === 0 ? "saddleBrown" : "$cardBg"}
              br="$5"
              ai={"center"}
              jc={"space-between"}
            >
              <Text fow={500} col={filter === 0 ? "white" : undefined}>
                Todos
              </Text>
            </Button>
          )}
          {categories &&
            categories.map((c) => (
              <CategoryDialog category={c} filter={filter} setFilter={setFilter}/>
            ))}
          {categories && (
            <CategoryDialog category={null} filter={null} setFilter={null}/>
          )}
        </XStack>
      </ScrollView>
      <XStack gap="$5" flexWrap="wrap">
        {dishes &&
          dishes.map((d) =>
            filter === 0 || filter === d.category_id ? (
              <XStack
                key={d.id}
                p="$4"
                bw={2}
                boc="$cardBorder"
                bg="$cardBg"
                br="$6"
                w="100%"
                $gtSm={{ w: "calc(50% - 15px)" }}
                $gtMd={{ w: "calc(33.333% - 20px)" }}
                $gtLg={{ w: "calc(25% - 20px)" }}
              >
                <YStack f={1} jc="space-between">
                  <YStack>
                    <XStack jc={"space-between"} ai={"center"}>
                      <Text fos={"$6"} fow={500} f={1} mr="$2">
                        {d.name}
                      </Text>
                      <Text
                        br={"$3"}
                        px={"$2.5"}
                        py={"$1.5"}
                        fos={"$2"}
                        fow={500}
                        col={d.available ? "$green700" : "$red700"}
                        bg={d.available ? "$green100" : "$red100"}
                      >
                        {d.available ? "Disponible" : "Agotado"}
                      </Text>
                    </XStack>
                    <Text fos={"$4"} mt={"$3"}>
                      {d.description}
                    </Text>
                  </YStack>

                  <YStack>
                    <XStack gap={"$3"} ai={"center"} mt={"$4"} mb={"$3"}>
                      <Text fow={600}>
                        {Intl.NumberFormat("es-BO", {
                          style: "currency",
                          currency: "BOB",
                        }).format(d.price)}
                      </Text>
                      <Text
                        col={"$amber700"}
                        bg={"$amber100"}
                        fos={"$3"}
                        px={"$3"}
                        py={"$1.5"}
                        br={"$3"}
                        fow={500}
                      >
                        {d.category_name}
                      </Text>
                    </XStack>
                    <MenuDialog editing={d} />
                  </YStack>
                </YStack>
              </XStack>
            ) : null,
          )}
      </XStack>
    </YStack>
  );
}
