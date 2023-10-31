console.clear();
process.title = 'Discord Multi-tool 1.0';

const Discord = require('discord.js-selfbot-v13');
const client = new Discord.Client({ checkUpdate: false });
const fs = require('fs');
const crypto = require('crypto');

const path_token = process.env.APPDATA + '\\token_clear.json';
const checar_token = () => fs.existsSync(path_token) ? (require(path_token) || false) : false;
const { SingleBar, Presets } = require('cli-progress');

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

function carregarToken() {
  const token_lol = checar_token();
  if (token_lol && token_lol.token) {
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

function printar_uso() {
  console.log(`
Discord multi-tool 1.0 by Desapressado (2023)

Uso: node ${__filename.split('\\').pop()} [-d delay] (-t token) id

  -d        Personaliza o delay de remoção em segundos (padrão: 1)
  -t        Token de autorização da sua conta Discord
  `);
}

async function parse_argv(args) {
  const argumentos = args.slice(2);

  let id;
  let token;
  let email;
  let senha;
  let delay = 1000;

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
    }
  }

  id = argumentos[argumentos.length - 1];
 
  if(!id) {
    printar_uso();
    process.exit(1);
  }

  const token_config = carregarToken();

  if (token_config) {
    token = token_config;
  }
  
  if (!token) {
    console.log("Token não foi encontrada em log e não foi fornecida por comando.")
    process.exit(1);
  }

  await clear(id, delay, token);
}

async function clear(id, delay, token) {
  const checa_token = checar_token();

  if (checa_token) {
    try {
      await client.login(carregarToken());
    } catch {
      console.clear();
      console.log("Token salva em log é inválida, rode o programa novamente.");
      fs.unlinkSync(path_token);
      process.exit(1);
    }
  } else {
    await client.login(token).then(() => {
      salvarToken(token);
    }).catch(() => {
      console.log("Token fornecida é inválida, saindo...");
      process.exit(1);
    });
  }

  const canal = client.channels.cache.get(id);

  if (!canal) {
    let user = await client.users.fetch(id).catch(() => {
      console.clear();
      console.log("ID fornecido é inválido, saindo...");
      process.exit(1);
    })

    await user?.createDM().then(c => id = c.id).catch(() => {
      console.clear();
      console.log("Não foi possível abrir DM com o usuário, saindo...");
      process.exit(1);
    });
  }

  const msgs = await fetch_msgs(id);

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
