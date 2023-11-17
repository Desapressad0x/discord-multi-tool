const Discord = require('discord.js-selfbot-v13');
const client = new Discord.Client({ checkUpdate: false });
const fs = require('fs');
const func = require('./misc/funcs.js');

/**
 * @param {string} token - Token de autorização do Discord.
 * @returns {void} - Inicia o processo de remoção das amizades.
 */
async function removerAmigos(delay, token) {
  await client.login(token).then(() => {
      func.salvarToken(token);
  }).catch(() => {
      console.log("           \u001b[41mToken fornecida é inválida, saindo...\u001b[0m");
      if (func.carregarToken()) {
        fs.unlinkSync(func.path_token);
      }
      process.exit(1);
  });

  const amigos = (await func.pegarRelac(client.token)).filter(r => r.type === 1);
  
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
      func.salvarToken(token);
  }).catch(() => {
      console.log("           \u001b[41mToken fornecida é inválida, saindo...\u001b[0m");
      if (func.carregarToken()) {
        fs.unlinkSync(func.path_token);
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

  const msgs = await func.fetchMsgs(client, id);
  
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
 * @returns {void} - Inicialização das funções da ferramenta e saída com status 0.
 */
async function main() {
  console.clear();
  process.title = 'Discord multi-tool 2.0';

  const args = process.argv.slice(2);
  const opcoes = func.parseArgs(args);
  await func.checarUpdates();

  if (opcoes.help || (!opcoes.removerAmigos && !opcoes.clearId)) {
    func.printarUso();
    process.exit(1);
  }

  if (!opcoes.token) {
    const tokenConfig = func.carregarToken();
    if (tokenConfig) {
      opcoes.token = tokenConfig;
    }
  }
  
  if(!opcoes.token) {
    func.printarUso();
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
