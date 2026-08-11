# Nexio Financeiro Android

O aplicativo Android empacota os mesmos assets Web do commit que gerou o artefato. Ele não redireciona para uma implantação remota e continua abrindo sem conexão; somente recursos que dependem de rede, como autenticação e sincronização, ficam indisponíveis offline.

## Dados do app

- App ID: `br.com.nexiofinanceiro.app`
- Web assets gerados em: `android-web/`
- Target SDK: 36
- Min SDK: 24
- Versão atual: `1.0.5` (`versionCode 5`)

## Rastreabilidade

`npm run android:web` copia apenas os arquivos Web necessários e gera `release-metadata.js` com:

- `versionName`;
- `versionCode`;
- commit Git completo;
- timestamp do commit;
- identificador de release;
- indicador de working tree alterado.

O `android-web/` é um diretório gerado e ignorado pelo Git. `npm run android:sync` sempre o reconstrói antes de executar o Capacitor Sync, evitando assets antigos no APK ou AAB.

## Preparar e sincronizar

```powershell
npm install
npm run android:sync
```

O sync gera os assets Web locais, copia-os para o projeto Android e reaplica os overrides nativos versionados.

## APK de teste

```powershell
npm run android:build:apk
```

Saída esperada:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

## Assinatura e AAB de produção

Nenhuma credencial é armazenada no repositório. Configure as quatro variáveis no ambiente seguro de build:

```text
NEXIO_ANDROID_KEYSTORE_FILE
NEXIO_ANDROID_KEYSTORE_PASSWORD
NEXIO_ANDROID_KEY_ALIAS
NEXIO_ANDROID_KEY_PASSWORD
```

Como alternativa local, use `android/signing.properties`, que é ignorado pelo Git, com as propriedades `storeFile`, `storePassword`, `keyAlias` e `keyPassword`. Não compartilhe nem versione esse arquivo ou a keystore.

Com credenciais válidas:

```powershell
npm run android:build:aab
```

Saída esperada:

```text
android\app\build\outputs\bundle\release\app-release.aab
```

O Gradle interrompe builds release quando a configuração estiver incompleta ou o arquivo da keystore não existir. Nunca crie uma identidade de assinatura substituta para contornar essa validação.

## Checklist do artefato

1. working tree limpo;
2. `npm test` aprovado;
3. `npm audit` sem vulnerabilidades;
4. `npm run android:sync` concluído;
5. metadados dentro dos assets iguais ao commit e à versão Android;
6. APK/AAB inspecionado e hash SHA-256 registrado;
7. teste em aparelho ou emulador antes da publicação.
