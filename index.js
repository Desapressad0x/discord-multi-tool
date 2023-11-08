console.clear();
process.title = 'Discord Multi-tool 1.0';

const Discord = require('discord.js-selfbot-v13');
const client = new Discord.Client({ checkUpdate: false });
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const crypto = require('crypto');

const path_token = path.join(os.homedir(), 'token_clear.json');
const checar_token = () => fs.existsSync(path_token) ? (require(path_token) || false) : false;
const { SingleBar, Presets } = require('cli-progress');

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
    var decipher = crypto.createDecipheriv('aes-256-cbc', token_lol.chave, token_lol.iv),
      buffer = Buffer.concat([
        decipher.update(Buffer.from(token_lol.token, 'base64')),
        decipher.final()
      ]);
    return buffer.toString().trim();
  } else {
    return null;
  }
}

/**
 * @param {string} canal - ID do canal a ser buscado.
 * @returns {Promise<object[]>} - Retorna uma lista das suas mensagens no canal especificado.
 */
async function fetch_msgs(canal) {
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
async function pegar_relac(token) {
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
function printar_uso() {
  console.log(`
Discord multi-tool 1.0 by Desapressado (2023)

Uso: node ${path.basename(__filename)} [-d delay] [--remover-amigos] [-t token] [-i id]

  -d                Personaliza o delay de remoção em segundos (padrão: 1)
  -t                Token de autorização da sua conta Discord
  -i                ID para operação específica
  --remover-amigos  Remove todos os amigos da sua conta
  `);
}

/**
 * @param {string[]} args - Argumentos da linha de comando.
 * @returns {void} - Analisa os argumentos e inicia o processo de limpeza.
 */
async function parse_argv(args) {
  const argumentos = args.slice(2);

  let id;
  let token;
  let delay = 1000;
  let remover_amigos = false;

  for (let i = 0; i < argumentos.length; i++) {
    switch (argumentos[i]) {
      case '-d':
        const valor_delay = parseInt(argumentos[i + 1]);
        if (!isNaN(valor_delay)) {
          delay = valor_delay * 1000;
        }
        break;
      case '-t':
        token = argumentos[i + 1];
        break;
	    case '--remover-amigos':
	      remover_amigos = true;
		    break;
	    case '-i':
	      id = argumentos[i + 1];
		    break;
    }
  }
  
  const token_config = carregarToken();

  if (token_config) {
    token = token_config;
  }
  
  if (!token) {
	printar_uso();
    process.exit(1);
  }
  
  if(remover_amigos) {
	await removerAmigos(delay, token);
  }
  
  if(id) {
	await clear(id, delay, token);
  } else if(!remover_amigos){
	printar_uso();
	process.exit(1);
  }
}

/**
 * @param {string} token - Token de autorização do Discord.
 * @returns {void} - Inicia o processo de remoção das amizades.
 */
async function removerAmigos(delay, token) {
 const checa_token = checar_token();
	
 if (checa_token) {
    try {
      await client.login(carregarToken());
    } catch {
      console.clear();
      console.log("           \u001b[41mToken salva em log é inválida, rode o programa novamente.\u001b[0m");
      fs.unlinkSync(path_token);
      process.exit(1);
    }
 } else {
    await client.login(token).then(() => {
      salvarToken(token);
    }).catch(() => {
      console.log("           \u001b[41mToken fornecida é inválida, saindo...\u001b[0m");
      process.exit(1);
    });
 }	
	
 const amigos = (await pegar_relac(client.token)).filter(r => r.type === 1);
 
 console.clear();
 console.log(`\x1b[33m
                    ____  _       __              __
   ____ ___  __  __/ / /_(_)     / /_____  ____  / /
  / __ \`__ \\/ / / / / __/ /_____/ __/ __ \\/ __ \\/ /
 / / / / / / /_/ / / /_/ /_____/ /_/ /_/ / /_/ / /
/_/ /_/ /_/\\__,_/_/\\__/_/      \\__/\\____/\\____/_/

                                             \x1b[97mv1.0
 `);
 console.log();

 const progresso = new SingleBar({
    format: '\u001b[35m[{bar}] {percentage}%\u001b[0m | {value}/{total} amizades restantes',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  }, Presets.shades_classic);

 progresso.start(amigos.length, 0);

 for (let i = 0; i < amigos.length; i++) {
    const amg = await client.users.fetch(amigos[i].id);
    await new Promise(r => setTimeout(r, delay));
    await amg.unFriend().catch(() => {});
    progresso.update(i + 1);
  }

 progresso.stop();
}

/**
 * @param {string} id - ID do canal ou usuário a ser limpo.
 * @param {number} delay - Delay entre as mensagens a serem excluídas.
 * @param {string} token - Token de autorização do Discord.
 * @returns {void} - Inicia o processo de limpeza das mensagens.
 */
async function clear(id, delay, token) {
  const checa_token = checar_token();

  if (checa_token) {
    try {
      await client.login(carregarToken());
    } catch {
      console.clear();
      console.log("           \u001b[41mToken salva em log é inválida, rode o programa novamente.\u001b[0m");
      fs.unlinkSync(path_token);
      process.exit(1);
    }
  } else {
    await client.login(token).then(() => {
      salvarToken(token);
    }).catch(() => {
      console.log("           \u001b[41mToken fornecida é inválida, saindo...\u001b[0m");
      process.exit(1);
    });
  }

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

  const msgs = await fetch_msgs(id);

  console.clear();
  console.log(`\x1b[33m
                    ____  _       __              __
   ____ ___  __  __/ / /_(_)     / /_____  ____  / /
  / __ \`__ \\/ / / / / __/ /_____/ __/ __ \\/ __ \\/ /
 / / / / / / /_/ / / /_/ /_____/ /_/ /_/ / /_/ / /
/_/ /_/ /_/\\__,_/_/\\__/_/      \\__/\\____/\\____/_/

                                             \x1b[97mv1.0
 `);
  console.log();


  const progresso = new SingleBar({
    format: '\u001b[35m[{bar}] {percentage}%\u001b[0m | {value}/{total} mensagens restantes',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  }, Presets.shades_classic);

  progresso.start(msgs.length, 0);

  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    await new Promise(r => setTimeout(r, delay));
    await msg.delete().catch(() => {});
    progresso.update(i + 1);
  }

  progresso.stop();
  process.exit(0);
}

parse_argv(process.argv);
