# Nexio Financeiro Android

Este projeto foi preparado para empacotar o site `https://nexiofinanceiro.vercel.app` em um aplicativo Android real usando Capacitor.

## Dados do app

- Nome: Nexio Financeiro
- App ID: `br.com.nexiofinanceiro.app`
- Site carregado no app: `https://nexiofinanceiro.vercel.app`
- Target SDK: 36, acima do requisito de API 35
- Min SDK: 24
- Permissoes: internet e estado da rede

## Preparar pela primeira vez

No terminal, dentro desta pasta:

```powershell
npm install
npm run android:setup
npm run android:open
```

O comando `android:setup` gera os assets do app, cria a plataforma Android, aplica os ajustes nativos e sincroniza o Capacitor.

Se a pasta `android` ja existir, use:

```powershell
npm run android:assets:source
npm run android:assets
npm run android:overrides
npm run android:sync
```

## Rodar teste no aparelho/emulador

Com Android Studio instalado e um aparelho ou emulador conectado:

```powershell
npm run android:debug
```

Tambem pode abrir no Android Studio e clicar em Run.

## Abrir no Android Studio

```powershell
npm run android:open
```

Ou abra manualmente a pasta:

```text
C:\Users\Dias.Maise\Documents\Projetos 2\android
```

## Gerar APK de teste

Pelo terminal:

```powershell
npm run android:build:apk
```

O arquivo costuma sair em:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

Pelo Android Studio:

```text
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

## Gerar AAB para Play Store

Pelo Android Studio, primeiro crie uma chave de assinatura:

```text
Build > Generate Signed Bundle / APK > Android App Bundle
```

Depois selecione ou crie a keystore, escolha `release` e gere o bundle.

Pelo terminal, depois que a assinatura estiver configurada:

```powershell
npm run android:build:aab
```

O arquivo costuma sair em:

```text
android\app\build\outputs\bundle\release\app-release.aab
```

## O que foi configurado

- Capacitor apontando para o dominio publicado do Nexio.
- Tela local de carregamento e tela offline amigavel.
- Status bar e navigation bar com cor da marca.
- Botao voltar: volta no historico do WebView; se estiver no inicio, pergunta se deseja sair.
- Links internos do dominio ficam dentro do app.
- Links externos abrem no navegador externo.
- Permissoes minimas para web app com checagem de conexao.
- Base de icone, splash e icone 512x512 para Play Store.

## Checklist Play Store

- Icone 512x512: `assets/play-store-icon-512.png`
- Prints do app em celular
- Politica de privacidade publicada em uma URL
- Descricao curta
- Descricao completa
- E-mail de suporte
- Categoria: Financas
- Idioma: Portugues Brasil
- Classificacao indicativa
- Teste fechado, se a Play Console exigir
