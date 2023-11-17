const crypto = require('crypto');
const os = require('os');
const https = require('https');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

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
async function fetchMsgs(client, canal) {
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
 * @returns {void} - Notifica sobre a atualização disponível.
 */
async function checarUpdates() {
  const versao_atual = require("../../package.json").version;

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
 futuramente novidades pra usar isso aqui
 
 * @param {string} prompt - Texto do input.
 * @returns {string} - Senha retornada pelo usuário.
 */
function inputSenha(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const stdin = process.openStdin();
    process.stdin.on('data', char => {
      char += '';
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.pause();
      } else {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(prompt + '*'.repeat(rl.line.length));
      }
    });

    rl.question(prompt, password => {
      rl.history = rl.history.slice(1);
      resolve(password);
      rl.close();
    });

    rl._writeToOutput = stringToWrite => {
      if (rl.output !== process.stdout) {
        rl.output.write(stringToWrite);
      }
    };
  });
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

module.exports = { salvarToken, carregarToken, path_token, checar_token, fetchMsgs, printarUso, checarUpdates, parseArgs, pegarRelac, inputSenha };