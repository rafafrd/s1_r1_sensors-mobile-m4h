# Permissões e Diferenças de Plataforma

## Permissões nativas

| Permissão | Como é pedida | Tela | Configuração em `app.json` |
|---|---|---|---|
| Localização em primeiro plano | `Location.requestForegroundPermissionsAsync()`, chamada a cada carregamento/atualização | Posição GPS | Nenhuma configuração extra necessária além do módulo `expo-location` instalado |
| Câmera | Hook `useCameraPermissions()` do `expo-camera`; solicitada automaticamente se ainda não concedida (`useEffect` chama `requestPermission()`) | Lanterna | Plugin `expo-camera` declarado em `app.json`, com `cameraPermission` customizada: *"Permitir que o app acesse a câmera para controlar a lanterna do dispositivo."* e `microphonePermission: false` (o app nunca grava áudio) |
| Movimento / Acelerômetro | Nenhum prompt explícito — `expo-sensors` não exige permissão de runtime na maioria das plataformas | Lanterna (gesto de balançar), Acelerômetro | Nenhuma |
| Estado de rede | Nenhum prompt — informação de rede é considerada pública pelo SO | Redes Wi-Fi | Nenhuma |

> A permissão de câmera existe **apenas** para controlar a tocha (`enableTorch`) via uma `CameraView` invisível — o app nunca exibe nem grava vídeo/foto.

## Diferenças entre Android, iOS e Web

| Recurso | Android | iOS | Web |
|---|---|---|---|
| GPS (`expo-location`) | Requer permissão de localização; funciona com Google Play Services para geocoding | Requer permissão de localização | Não suportado (`reverseGeocodeAsync`/`getCurrentPositionAsync` não funcionam) |
| Geocodificação reversa | Pode falhar em emuladores sem Google Play Services | Geralmente estável; devolve também `timezone` | Não suportado |
| Modo avião (`isAirplaneModeEnabledAsync`) | ✅ Suportado | ❌ Não existe API equivalente — a tela de Redes Wi-Fi trata isso como `null` ("Indisponível") | ❌ Não suportado |
| Lanterna (`enableTorch` via `expo-camera`) | ✅ Suportado em dispositivos com flash | ✅ Suportado em dispositivos com flash | ❌ Sem hardware de flash controlável |
| Acelerômetro (`expo-sensors`) | ✅ Suportado (`isAvailableAsync` pode retornar `false` em emuladores sem sensor virtual) | ✅ Suportado | Suporte parcial/inconsistente entre navegadores |

## Limitações do Expo Go

O projeto roda em **Expo Go** (sem *development build* customizado), o que impõe alguns limites já tratados explicitamente no código:

- **Varredura de redes Wi-Fi próximas e leitura de SSID** não são permitidas no Expo Go — exigem um módulo nativo fora do sandbox padrão. Por isso `RedesWifiScreen` mostra apenas os dados da **conexão ativa** (tipo, IP, alcance de internet, modo avião), com um card explicando essa limitação para o usuário.
- **Emuladores Android sem Google Play Services** podem fazer `reverseGeocodeAsync` falhar mesmo com o GPS funcionando — por isso a tela de GPS trata o erro de geocodificação (`addressError`) separado do erro de localização (`errorMsg`).
- Testar em dispositivo físico é recomendado para os quatro sensores, especialmente Acelerômetro e Lanterna — emuladores/simuladores costumam ter suporte parcial ou nenhum a sensores de movimento e flash real.
