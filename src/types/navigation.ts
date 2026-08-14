export type RootStackParamList = {
  LoginScreen: undefined;
  // userName chega obrigatoriamente pela LoginScreen — nunca navegamos pra cá sem esse dado
  HomeScreen: { userName: string };
  PosicaoGpsScreen: undefined;
  LanternaScreen: undefined;
  RedesWifiScreen: undefined;
  AcelerometroScreen: undefined;
}