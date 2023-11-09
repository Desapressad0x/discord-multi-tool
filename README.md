# Discord multi-tool 2.0

Esta é uma ferramenta self-bot CLI projetada para limpar mensagens de um canal do Discord ou mensagens diretas (DMs). Ela permite a remoção em massa de mensagens automatizando sua conta. Self-bots violam os Termos de Serviço do Discord, portanto, use esta ferramenta por sua conta e risco.

```
Discord multi-tool 2.0 by Desapressado (2023)

Uso: node index.js [-d delay] [--remover-amigos] [-t token] [-i id]

  -d                Personaliza o delay de remoção em segundos (padrão: 1)
  -t                Token de autorização da sua conta Discord
  -i                ID para operação específica
  --remover-amigos  Remove todos os amigos da sua conta
```

## Começando

### Pré-requisitos

Você precisa ter o Node.js instalado em seu sistema.

### Instalação

1. Clone ou baixe este repositório para o seu computador local.

2. Abra um terminal e navegue até o diretório onde você armazenou o código.

3. Instale as dependências necessárias executando o seguinte comando:

   ```bash
   npm install
   ```

   Ou execute o arquivo bat iniciar na pasta do projeto caso esteja no Windows.

## Uso

Antes de usar a ferramenta, você precisa fornecer seu token do Discord.

1. **Fornecendo o Token via Linha de Comando:**
   - Execute a ferramenta usando a opção `-t` e forneça seu token do Discord diretamente.

   ```bash
   node index.js -t SEU_TOKEN_DO_DISCORD CANAL_OU_ID_DO_USUÁRIO
   ```

   Substitua `SEU_TOKEN_DO_DISCORD` pelo seu token do Discord e `CANAL_OU_ID_DO_USUÁRIO` pelo ID do canal ou usuário do qual você deseja limpar as mensagens.

2. **Limpeza de Mensagens:**

   Ao usar a ferramente pela primeira vez, a sua token é salva na pasta `%HOMEPATH%` (Windows), `/home/user` (Linux) ou `/Users/user` (macOS) do seu sistema num arquivo `token_clear.json` de forma criptografada, então você poderá executar pela segunda vez sem inserir a token dessa forma:

   ```bash
   node index.js CANAL_OU_ID_DO_USUÁRIO
   ```

   Substitua `CANAL_OU_ID_DO_USUÁRIO` pelo ID do canal ou usuário do qual você deseja limpar as mensagens.

3. **Personalização do Delay:**

   Você pode personalizar o delay entre a exclusão de mensagens usando a opção `-d`. Por padrão, o atraso está definido como 1 segundo.

   ```bash
   node index.js -d ATRASO_EM_SEGUNDOS CANAL_OU_ID_DO_USUÁRIO
   ```

   Substitua `ATRASO_EM_SEGUNDOS` pelo atraso desejado e `CANAL_OU_ID_DO_USUÁRIO` pelo ID do canal ou usuário do qual você deseja limpar as mensagens.

4. **Remoção de Amigos**

   Você pode usar a opção `--remover-amigos` para remover todos os amigos da sua conta Discord. Isso é útil se você deseja limpar sua lista de amigos de forma rápida.

   Esta opção não requer a especificação de um canal ou ID de usuário, uma vez que ela se aplica a toda a sua lista de amigos no Discord, mas você ainda pode especificar o delay.

   ```bash
   node index.js -d 1 -t SEU_TOKEN_DO_DISCORD --remover-amigos
   ```

  Substitua `SEU_TOKEN_DO_DISCORD` pelo seu token do Discord

## Aviso Legal

**Nota**: Esta ferramenta usa um self-bot, o que é contra os Termos de Serviço do Discord. O uso de self-bots pode resultar na proibição de sua conta. Use esta ferramenta por sua conta e risco e esteja ciente das consequências.

## Licença

Este projeto não está sob uma licença específica e é apenas para fins educacionais. Use-o de forma responsável e dentro dos limites da lei e dos Termos de Serviço do Discord.
