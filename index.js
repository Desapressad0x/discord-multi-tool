const Discord = require('discord.js-selfbot-v13');
const client = new Discord.Client({ checkUpdate: false });
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const crypto = require('crypto');

const path_token = path.join(os.homedir(), 'token_clear.json');
const checar_token = () => fs.existsSync(path_token) ? (require(path_token) || false) : false;

/**
 * @param {string} token - Token a ser salva.
 * @returns {void} - Realiza a criptografia e salva o token em um arquivo.
 */
function salvarToken(token) {
  const chave = crypto.randomBytes(16).toString('hex').toUpperCase();
  const iv = crypto.randomBytes(8).toString('hex').toUpperCase();
  const encipher = crypto.createCipheriv('aes-256-cbc', chave, iv);
  
  const buffer = Buffer.concat([
      encipher.update(token),
      encipher.final()
  ]);

  const dados = JSON.stringify({ token: buffer.toString('base64'), chave: chave, iv: iv }, null, 2);

  fs.writeFileSync(path_token, dados, { encoding: 'utf8' });
}

/**
 * @returns {string|null} - Lê o arquivo de token, descriptografa e retorna o token, ou null se não encontrado.
 */
function carregarToken() {
  const token_lol = checar_token();
  if (token_lol && token_lol.token && token_lol.chave && token_lol.iv) {
    try {
      var decipher = crypto.createDecipheriv('aes-256-cbc', token_lol.chave, token_lol.iv),
      buffer = Buffer.concat([
        decipher.update(Buffer.from(token_lol.token, 'base64')),
        decipher.final()
      ]);
    
      return buffer.toString().trim();
    } catch {
      fs.unlinkSync(path_token);
      return null;
    }
  } else {
    return null;
  }
}

/**
 * @param {string} canal - ID do canal a ser buscado.
 * @returns {Promise<object[]>} - Retorna uma lista das suas mensagens no canal especificado.
 */
async function fetchMsgs(canal) {
  const canall = client.channels.cache.get(canal);
  let ultimoid;
  let messages = [];

  while (true) {
    const fetched = await canall.messages.fetch({
      limit: 100,
      ...(ultimoid && { before: ultimoid }),
    });

    if (fetched.size === 0) {
      return messages.filter(msg => msg.author.id == client.user.id && !msg.system);
    }

    messages = messages.concat(Array.from(fetched.values()));
    ultimoid = fetched.lastKey();
  }
}

/**
 * @param {string} token - Token de autorização do Discord.
 * @returns {Promise<Array>} - Uma promessa que será resolvida com um array de relacionamentos da conta.
 */
async function pegarRelac(token) {
  const args = {
    hostname: 'discord.com',
    path: '/api/v9/users/@me/relationships',
    method: 'GET',
    headers: {
      'Authorization': token,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2vyIjoiq2hyb21liwizgv2awnlijoiisiwic3lzdgvtx2xvzy2fszsi6inb0lujsiwibnjvd3nlcl91czvyx2fnzw50ijoin96awxsys81ljiw (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/110.0.0.0 safari/537.36',
      'Referer': 'https://discord.com/channels/@me'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(args, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * @returns {void} - Imprime informações de uso do programa.
 */
function printarUso() {
  console.log(`
Discord multi-tool 2.0 by Desapressado (2023)

Uso: node ${path.basename(__filename)} [-d delay] [--remover-amigos] [-t token] [-i id]

  -d                Personaliza o delay de uma ação em segundos (padrão: 1)
  -t                Token de autorização da sua conta Discord
  -i                ID para operação específica
  --remover-amigos  Remove todos os amigos da sua conta
  
  --help            Imprime informações de uso
  `);
}

/**
 * @param {string} token - Token de autorização do Discord.
 * @returns {void} - Inicia o processo de remoção das amizades.
 */
async function removerAmigos(delay, token) {
  await client.login(token).then(() => {
    salvarToken(token);
  }).catch(() => {
      console.log("           \u001b[41mToken fornecida é inválida, saindo...\u001b[0m");
      if (carregarToken()) {
        fs.unlinkSync(path_token);
      }
      process.exit(1);
  });

  const amigos = (await pegarRelac(client.token)).filter(r => r.type === 1);
  
  if (!amigos.length) {
    console.clear();
    console.log(`
	  \x1b[33m
                    ____  _       __              __
   ____ ___  __  __/ / /_(_)     / /_____  ____  / /
  / __ \`__ \\/ / / / / __/ /_____/ __/ __ \\/ __ \\/ /
 / / / / / / /_/ / / /_/ /_____/ /_/ /_/ / /_/ / /
/_/ /_/ /_/\\__,_/_/\\__/_/      \\__/\\____/\\____/_/

                                             \x1b[97mv2.0
	`);
    console.log();
    console.log(`\u001b[35m[                                                  ]\u001b[0m | 0.00% | 0/0 amizades restantes`);
  } else {
    for (let i = 0; i < amigos.length; i++) {
      const amg = await client.users.fetch(amigos[i].id);
      await new Promise(r => setTimeout(r, delay));
      await amg.unFriend().catch(() => {});

      const porcentagem = ((i + 1) / amigos.length) * 100;
      const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + ' '.repeat(50 - Math.floor(porcentagem / 2)) + ']';
	
      console.clear();
      console.log(`\x1b[33m
                    ____  _       __              __
   ____ ___  __  __/ / /_(_)     / /_____  ____  / /
  / __ \`__ \\/ / / / / __/ /_____/ __/ __ \\/ __ \\/ /
 / / / / / / /_/ / / /_/ /_____/ /_/ /_/ / /_/ / /
/_/ /_/ /_/\\__,_/_/\\__/_/      \\__/\\____/\\____/_/

                                             \x1b[97mv2.0
 `);
      console.log();
      console.log(`\u001b[35m${progresso}\u001b[0m | ${porcentagem.toFixed(2)}% | ${i + 1}/${amigos.length} amizades restantes`);
    }
  }
}

/**
 * @param {string} id - ID do canal ou usuário a ser limpo.
 * @param {number} delay - Delay entre as mensagens a serem excluídas.
 * @param {string} token - Token de autorização do Discord.
 * @returns {void} - Inicia o processo de limpeza das mensagens.
 */
async function removerMensagens(id, delay, token) {
  await client.login(token).then(() => {
    salvarToken(token);
  }).catch(() => {
      console.log("           \u001b[41mToken fornecida é inválida, saindo...\u001b[0m");
      if (carregarToken()) {
        fs.unlinkSync(path_token);
      }
      process.exit(1);
  });

  const canal = client.channels.cache.get(id);

  if (!canal) {
    let user = await client.users.fetch(id).catch(() => {
      console.clear();
      console.log("           \u001b[41mID fornecido é inválido, saindo...\u001b[0m");
      process.exit(1);
    })

    await user?.createDM().then(c => id = c.id).catch(() => {
      console.clear();
      console.log("           \u001b[41mNão foi possível abrir DM com o usuário, saindo...\u001b[0m");
      process.exit(1);
    });
  }

  const msgs = await fetchMsgs(id);
  
  if (!msgs.length) {
    console.clear();
    console.log(`
	  \x1b[33m
                    ____  _       __              __
   ____ ___  __  __/ / /_(_)     / /_____  ____  / /
  / __ \`__ \\/ / / / / __/ /_____/ __/ __ \\/ __ \\/ /
 / / / / / / /_/ / / /_/ /_____/ /_/ /_/ / /_/ / /
/_/ /_/ /_/\\__,_/_/\\__/_/      \\__/\\____/\\____/_/

                                             \x1b[97mv2.0
	`);
    console.log();
    console.log(`\u001b[35m[                                                  ]\u001b[0m | 0.00% | 0/0 mensagens restantes`);
  } else {

  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    await new Promise(r => setTimeout(r, delay));
    await msg.delete().catch(() => {});

    const porcentagem = ((i + 1) / msgs.length) * 100;
    const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + ' '.repeat(50 - Math.floor(porcentagem / 2)) + ']';
	
    console.clear();
    console.log(`\x1b[33m
                    ____  _       __              __
   ____ ___  __  __/ / /_(_)     / /_____  ____  / /
  / __ \`__ \\/ / / / / __/ /_____/ __/ __ \\/ __ \\/ /
 / / / / / / /_/ / / /_/ /_____/ /_/ /_/ / /_/ / /
/_/ /_/ /_/\\__,_/_/\\__/_/      \\__/\\____/\\____/_/

                                             \x1b[97mv2.0
 `);
    console.log();
    console.log(`\u001b[35m${progresso}\u001b[0m | ${porcentagem.toFixed(2)}% | ${i + 1}/${msgs.length} mensagens restantes`);
  }
 }
}

/**
 * @param {string[]} args - Array de argumentos da linha de comando.
 * @returns {Object} - Object contendo as opções escolhidas.
 */
function parseArgs(args) {
  const opcoes = {
    help: false,
    token: null,
    delay: 1000,
    removerAmigos: false,
    clearId: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-d':
        const delay = parseInt(args[i + 1]);
        if (!isNaN(delay)) {
          opcoes.delay = delay * 1000;
        }
        break;
      case '-t':
        opcoes.token = args[i + 1];
        break;
      case '--remover-amigos':
        opcoes.removerAmigos = true;
        break;
      case '-i':
        opcoes.clearId = args[i + 1];
        break;
      case '--help':
        opcoes.help = true;
        break;
    }
  }

  return opcoes;
}

/**
 * @returns {void} - Notifica sobre a atualização disponível.
 */
async function checarUpdates() {
  const versao_atual = require(path.join(__dirname, 'package.json')).version;

  const args = {
    hostname: 'raw.githubusercontent.com',
    path: '/Desapressad0x/discord-multi-tool/main/package.json',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const req = https.request(args, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        req.on('error', reject);

        res.on('end', () => {
          if (versao_atual !== JSON.parse(data).version) {
            console.log("           \u001b[43;30mHá uma atualização disponível, baixe no repositório do GitHub (Desapressad0x).\u001b[0m");
          }
          resolve();
        });
      });

      req.on('error', reject);
      req.end();
    });
  } catch {}
}

/**
 * @returns {void} - Inicialização das funções da ferramenta e saída com status 0.
 */
async function main() {
  console.clear();
  process.title = 'Discord multi-tool 2.0';

  const args = process.argv.slice(2);
  const opcoes = parseArgs(args);
  await checarUpdates();

  if (opcoes.help || (!opcoes.removerAmigos && !opcoes.clearId)) {
    printarUso();
    process.exit(1);
  }

  if (!opcoes.token) {
    const tokenConfig = carregarToken();
    if (tokenConfig) {
      opcoes.token = tokenConfig;
    }
  }
  
  if (!opcoes.token) {
    printarUso();
    process.exit(1);
  }

  if (opcoes.removerAmigos) {
    await removerAmigos(opcoes.delay, opcoes.token);
  }

  if (opcoes.clearId) {
    await removerMensagens(opcoes.clearId, opcoes.delay, opcoes.token);
  }

  process.exit(0);
}

main();
