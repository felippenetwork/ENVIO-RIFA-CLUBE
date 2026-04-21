const { getPeriodoDia } = require('./utils');

const greetingEmojis = [
  '🔥', '😊🔥', '🙏😎', '🌟', '😍🔥', '🤩', '💪🎉', '🎯😊',
  '🌈🔥', '🤙😎', '😁🔥', '💪', '🎯', '🌟🔥', '😍', '🤙',
  '🎉', '🏆', '💥', '😄🏆', '🤩🥩', '😎💥🔥', '💪🎯🔥', '🎊🔥',
  '😄💥🔥', '🤙🔥🥩', '🌟🔥🎉', '😊🏆🔥', '🔥😁🎟️', '🤩🥩🔥',
  '🎊💥', '💥😄', '😁🎯', '🌈', '🤩💥', '😎🎟️', '🌟💪', '😍🔥',
  '🤙', '🎊🔥🥩', '🏃‍♂️🔥💨', '😎💪', '🎯😊', '🔥💥', '🌈💥',
  '😍', '🤙🔥', '🌟😎', '💪💥', '🏆🎯', '🌟🔥😄'
];

const bodyIntroEmojis = [
  ['🎟️', '🥩'], ['🍖', '🏆'], ['🔥🎟️', '🥩🎉'], ['🎊🔥', '🍖'],
  ['🥩🔥', '🎉'], ['🎉🥩', '🔥'], ['🏆🍖', '🔥'], ['🔥🎉', '🥩'],
  ['🥩🎟️', '🏆'], ['🍖🏆', '🔥'], ['🔥🍖', '🥩🏆'], ['🎟️🎉', '🥩🔥'],
  ['🥩🏆', '🔥'], ['🎊🔥🔥', '🍖'], ['🔥🥩', '🎟️'], ['🥩🎉', '🔥'],
  ['🍖🔥', '🥩'], ['🎉🔥', '🥩🍖'], ['🏆🎊', '🔥'], ['🔥🏆', '🥩'],
  ['🥩🍖', '🎟️🏆'], ['🎟️🥩🏆', '🔥🎉💥'], ['🥩🍖🎟️', '🏆🎉💥'],
  ['🍻🥩', ''], ['🔥🍖', '🥩🏆'], ['🥂', ''], ['🍺', '']
];

const bodyTexts = [
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'ESTÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'NOSSA RIFINHA BOLADA TÁ ROLANDO LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'TÁ ACONTECENDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! QUALIDADE DEMAIS!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! QUALIDADE TOTAL!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! QUALIDADE DE VERDADE!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! PURA QUALIDADE!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! NO PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'NOSSA RIFINHA BOLADA ESTÁ ROLANDO LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'VEM QUE TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'NÃO PERDE! TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! COM O PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!',
  'APROVEITA QUE TÁ ROLANDO NOSSA RIFINHA BOLADA LÁ NO GRUPO! PADRÃO CLUBE DO CHURRASCO! MUITA QUALIDADE!'
];

const sendTexts = [
  'PEGANDO 1 NÚMERO JÁ AJUDA!',
  '1 NÚMERO JÁ AJUDA!',
  'PEGANDO 1 NÚMERO JÁ AJUDA MUITO!',
  '1 NUMERINHO JÁ AJUDA!',
  'SÓ 1 NÚMERO JÁ AJUDA!',
  'BORA PEGAR 1 NÚMERO!',
  'VAI LÁ E PEGA 1 NÚMERO!',
  'GARANTE JÁ 1 NÚMERO!',
  'VEM GARANTIR 1 NÚMERO!',
  '1 NÚMERO JÁ FAZ A DIFERENÇA!',
  'MESMO 1 NÚMERO JÁ AJUDA!',
  'CORRE E PEGA 1 NÚMERO!'
];

const ctaTexts = [
  'COOORRE LÁ PRA GARANTIR SEU PALPITE!',
  'COOORRE LÁ PRA GARANTIR SEU PALPITE ANTES QUE ACABE!',
  'COOORRE LÁ PRA GARANTIR SEU PALPITE JÁ!',
  'COOORRE LÁ PRA GARANTIR SEU PALPITE AGORA!',
  'COOORRE LÁ PRA GARANTIR SEU PALPITE AINDA HOJE!',
  'CORRE LÁ GARANTIR SEU PALPITE!',
  'VAI LÁ GARANTIR SEU PALPITE!',
  'BORA LÁ GARANTIR SEU PALPITE!',
  'SE JOGA LÁ PRA GARANTIR SEU PALPITE!',
  'NÃO PERDE SEU PALPITE LÁ!',
  'ENTRA LÁ E GARANTE SEU PALPITE!'
];

const ctaEmojis = [
  ['🏃‍♂️🎯', '🎉'], ['💨🏃‍♂️', '🎟️'], ['⚡', '🏆🍖'], ['🚀', '🥩💥'],
  ['🔥', '🍖🎟️'], ['💥🏃‍♂️', '🎊'], ['🌪️', '🏆'], ['👟', '🍖💪'],
  ['👊', '🎟️🏆'], ['💥🎯', '😍'], ['🏃‍♂️💨', '💥'], ['', '🏆🎊✅'],
  ['', '🎟️💪🏃‍♂️'], ['', '🍖🎯'], ['', '💥🏃‍♂️🎉']
];

const sendEmojis = [
  '💪', '🙌', '🎯', '💥', '😊', '😁', '🔥', '🎊', '🏃‍♂️', '⚡', '🌟', '👊'
];

const btn1Emojis = [
  '🎟️', '🔥', '✅', '🏆', '🎉', '🎊', '⚡', '🚀', '💪', '🌟',
  '😍', '🤩', '💥', '🎯', '🍖', '🥩', '🏃‍♂️', '👊', '🔑', '🎈'
];

const btn2Emojis = [
  '👋', '❌', '🙅', '😅', '🤚', '👐', '🙏', '😬', '🤷', '🙈',
  '🫣', '🫡', '😶', '🤐', '🙊', '😌', '🤦', '🫠', '😔', '🤏'
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomMessage(name) {
  const periodo = getPeriodoDia();
  const gEmoji = pickRandom(greetingEmojis);
  const bIntro = pickRandom(bodyIntroEmojis);
  const bText = pickRandom(bodyTexts);
  const sText = pickRandom(sendTexts);
  const sEmoji = pickRandom(sendEmojis);
  const cText = pickRandom(ctaTexts);
  const cEmoji = pickRandom(ctaEmojis);

  const introLeft = bIntro[0] ? bIntro[0] + ' ' : '';
  const introRight = bIntro[1] ? ' ' + bIntro[1] : '';
  const ctaLeft = cEmoji[0] ? cEmoji[0] + ' ' : '';
  const ctaRight = cEmoji[1] ? ' ' + cEmoji[1] : '';

  return [
    `Mto ${periodo} ${name}, tudo bom! ${gEmoji}`,
    `.`,
    `${introLeft}${bText}${introRight}`,
    `.`,
    `${sText} ${sEmoji}`,
    `.`,
    `${ctaLeft}${cText}${ctaRight}`
  ].join('\n');
}

function getRandomBtn1() {
  const emoji = pickRandom(btn1Emojis);
  return `${emoji} Participar Agora`;
}

function getRandomBtn2() {
  const emoji = pickRandom(btn2Emojis);
  return `${emoji} Essa vou passar`;
}

module.exports = { getRandomMessage, getRandomBtn1, getRandomBtn2 };
