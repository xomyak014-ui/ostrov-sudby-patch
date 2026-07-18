const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const store = require('./ticketStore');
const logger = require('./logger');

const PANEL_BUTTON_ID = 'ticket_create';
const CLOSE_BUTTON_ID = 'ticket_close';
const CONFIRM_CLOSE_ID = 'ticket_confirm_close';
const CANCEL_CLOSE_ID = 'ticket_cancel_close';

function supportRoleIds() {
  const raw = process.env.SUPPORT_ROLE_IDS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function panelEmbed() {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🏝️ Остров Судьбы — Поддержка')
    .setDescription(
      [
        'Нужна помощь администрации или модерации?',
        'Нажмите кнопку ниже — откроется личный канал тикета.',
        '',
        'Опишите проблему сразу после открытия: так мы поможем быстрее.',
      ].join('\n')
    )
    .setFooter({ text: 'Один открытый тикет на игрока' });
}

function panelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(PANEL_BUTTON_ID)
      .setLabel('Создать тикет')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🎫')
  );
}

function closeRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(CLOSE_BUTTON_ID)
      .setLabel('Закрыть тикет')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );
}

async function ensurePanel(client) {
  const channelId = process.env.TICKET_CHANNEL_ID;
  if (!channelId) {
    throw new Error('TICKET_CHANNEL_ID не задан в .env');
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    throw new Error(`Канал тикетов не найден или недоступен: ${channelId}`);
  }

  const messages = await channel.messages.fetch({ limit: 20 });
  const existing = messages.find(
    (m) =>
      m.author.id === client.user.id &&
      m.components?.some((row) => row.components?.some((c) => c.customId === PANEL_BUTTON_ID))
  );

  if (existing) {
    await existing.edit({ embeds: [panelEmbed()], components: [panelRow()] });
    logger.info(`Панель тикетов обновлена в #${channel.name}`);
    return;
  }

  await channel.send({ embeds: [panelEmbed()], components: [panelRow()] });
  logger.info(`Панель тикетов отправлена в #${channel.name}`);
}

async function createTicket(interaction) {
  const existing = store.getOpenByUser(interaction.user.id);
  if (existing) {
    return interaction.reply({
      content: `У вас уже есть открытый тикет: <#${existing.channelId}>`,
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const number = store.nextNumber();
  const prefix = process.env.TICKET_PREFIX || 'ticket';
  const name = `${prefix}-${String(number).padStart(4, '0')}`;

  const overwrites = [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: interaction.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  for (const roleId of supportRoleIds()) {
    overwrites.push({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const categoryId = process.env.TICKET_CATEGORY_ID || null;
  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    permissionOverwrites: overwrites,
    topic: `Тикет #${number} | ${interaction.user.tag} (${interaction.user.id})`,
  });

  store.create({
    channelId: channel.id,
    userId: interaction.user.id,
    number,
  });

  const welcome = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`Тикет #${number}`)
    .setDescription(
      [
        `Здравствуйте, ${interaction.user}!`,
        'Опишите вашу проблему или вопрос.',
        'Администрация ответит в этом канале.',
        '',
        'Чтобы закрыть тикет — нажмите кнопку ниже.',
      ].join('\n')
    )
    .setTimestamp();

  const mentionRoles = supportRoleIds().map((id) => `<@&${id}>`).join(' ');
  await channel.send({
    content: `${interaction.user} ${mentionRoles}`.trim(),
    embeds: [welcome],
    components: [closeRow()],
  });

  logger.info(`Тикет #${number} создан: ${channel.id} пользователем ${interaction.user.id}`);
  return interaction.editReply({ content: `Тикет создан: ${channel}` });
}

async function requestClose(interaction) {
  const ticket = store.getByChannel(interaction.channelId);
  if (!ticket || ticket.status !== 'open') {
    return interaction.reply({
      content: 'Это не активный канал тикета.',
      ephemeral: true,
    });
  }

  const isOwner = ticket.userId === interaction.user.id;
  const member = interaction.member;
  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    supportRoleIds().some((id) => member.roles.cache.has(id));

  if (!isOwner && !isStaff) {
    return interaction.reply({
      content: 'Закрыть тикет может только автор или поддержка.',
      ephemeral: true,
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(CONFIRM_CLOSE_ID)
      .setLabel('Да, закрыть')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(CANCEL_CLOSE_ID)
      .setLabel('Отмена')
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.reply({
    content: 'Закрыть этот тикет? Канал будет удалён через несколько секунд.',
    components: [row],
    ephemeral: true,
  });
}

async function confirmClose(interaction) {
  const ticket = store.getByChannel(interaction.channelId);
  if (!ticket || ticket.status !== 'open') {
    return interaction.reply({
      content: 'Тикет уже закрыт или не найден.',
      ephemeral: true,
    });
  }

  store.close(interaction.channelId);
  await interaction.update({
    content: 'Тикет закрывается…',
    components: [],
  });

  try {
    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(`Тикет закрыт ${interaction.user}. Канал удалится через 5 секунд.`),
      ],
    });
  } catch {
    // канал мог быть недоступен
  }

  logger.info(`Тикет #${ticket.number} закрыт ${interaction.user.id}, канал ${interaction.channelId}`);

  setTimeout(async () => {
    try {
      await interaction.channel.delete('Тикет закрыт');
    } catch (err) {
      logger.error('Не удалось удалить канал тикета', err);
    }
  }, 5000);
}

async function cancelClose(interaction) {
  return interaction.update({
    content: 'Закрытие отменено.',
    components: [],
  });
}

async function handleInteraction(interaction) {
  if (!interaction.isButton()) return false;

  try {
    switch (interaction.customId) {
      case PANEL_BUTTON_ID:
        await createTicket(interaction);
        return true;
      case CLOSE_BUTTON_ID:
        await requestClose(interaction);
        return true;
      case CONFIRM_CLOSE_ID:
        await confirmClose(interaction);
        return true;
      case CANCEL_CLOSE_ID:
        await cancelClose(interaction);
        return true;
      default:
        return false;
    }
  } catch (err) {
    logger.error('Ошибка обработки кнопки тикета', err);
    const payload = {
      content: 'Произошла ошибка. Попробуйте ещё раз чуть позже.',
      ephemeral: true,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
    return true;
  }
}

module.exports = {
  ensurePanel,
  handleInteraction,
};
