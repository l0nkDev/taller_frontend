import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  YStack,
  Button,
  Text,
  Card,
  Spinner,
  Label,
  XStack,
  H1
} from "tamagui";
import { useLoginMutation } from "../../api/authApi";
import { useAppDispatch } from "../../store/hooks";
import { setCredentials } from "../../store/authSlice";
import { Lock, EyeOff, Eye, User } from "@tamagui/lucide-icons";
import { Input } from "../../components/Input";
import { isFetchBaseQueryError } from "../../utils/errorHelpers";
import { useToastController } from "@tamagui/toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const toast = useToastController();

  const handleLogin = async () => {
    try {
      const data = await login({ username, password }).unwrap();
      dispatch(
        setCredentials({
          token: data.access_token,
          user: data.user,
        }),
      );
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("FastAPI Login Error:", err);

      let errorMessage = "No se pudo conectar con el servidor.";

      if (isFetchBaseQueryError(err)) {
        if (err.status === 401) {
          errorMessage = "El usuario o la contraseña son incorrectos.";
        } else if (err.status === 422) {
          errorMessage = "Datos de formulario inválidos.";
        } else if (
          "data" in err &&
          typeof err.data === "object" &&
          err.data !== null
        ) {
          const backendData = err.data as { detail?: string };
          if (backendData.detail) errorMessage = backendData.detail;
        }
      }
      toast.show("Error de Acceso", {
        message: errorMessage,
        customData: { type: "error" },
      });
    }
  };

  return (
    <YStack f={1} jc="center" ai="center" bg="$bgGradientStart" p="$4">
      <Card
        bw={2}
        boc="$cardBorder"
        bg="$cardBg"
        p="$8"
        br="$6"
        elevation="$4"
        w="100%"
        maw={450}
      >
        <YStack ai="center" mb="$8" gap="$2">
          <YStack
            w={80}
            h={80}
            br="$4"
            jc="center"
            ai="center"
            backgroundImage="linear-gradient(to bottom right, var(--brandMain), var(--orange500))"
          >
            <Text fontSize={40}>🍽️</Text>
          </YStack>
          <H1 color="$primaryText" size="$9" ta="center">
            Tu Café - Cotoca
          </H1>
          <Text color="$brandAccent" fontWeight="600">
            Gastronomía Artesanal
          </Text>
        </YStack>

        <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <YStack gap="$2">
            <Label color="$primaryText" size="$3">
              Usuario
            </Label>
            <XStack ai="center" pos="relative">
              <YStack pos="absolute" l={12} zi={1}>
                <User size={20} color="$brandAccent" />
              </YStack>
              <Input
                f={1}
                pl={45}
                bw={2}
                bc="$cardBorder"
                bg="$cardBg"
                outlineStyle="none"
                outlineColor="transparent"
                focusStyle={{
                  boc: "$brandMain",
                }}
                placeholder="ejemplo123"
                value={username}
                onChangeText={setUsername}
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Label color="$primaryText" size="$3">
              Contraseña
            </Label>
            <XStack ai="center" pos="relative">
              <YStack pos="absolute" l={12} zi={1}>
                <Lock size={20} color="$brandAccent" />
              </YStack>
              <Input
                value={password}
                onChangeText={setPassword}
                f={1}
                pl={45}
                pr={45}
                bw={2}
                bc="$cardBorder"
                bg="$cardBg"
                placeholder="••••••••"
                focusStyle={{ boc: "$brandMain" }}
                secureTextEntry={!showPassword}
                outlineWidth={0}
              />
              <Button
                pos="absolute"
                r={5}
                chromeless
                p="$2"
                onPress={() => setShowPassword(!showPassword)}
                icon={showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              />
            </XStack>
          </YStack>

          <Button
            backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
            size="$5"
            hoverStyle={{ scale: 1.02 }}
            onPress={handleLogin}
            disabled={isLoading || username.length === 0 || password.length < 8}
            disabledStyle={{ opacity: 0.5 }}
          >
            {isLoading ? (
              <Spinner color="white" />
            ) : (
              <Text color="white" fontWeight="600" fontFamily="$body">
                Iniciar sesión
              </Text>
            )}
          </Button>
        </form>
      </Card>
    </YStack>
  );
}
