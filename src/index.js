require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');
const keepAlive = require('./keepAlive.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('jeger')
        .setDescription('Сазнај више о Јегермајстеру'),
    new SlashCommandBuilder()
        .setName('cocktail')
        .setDescription('Пронађи рецепт за коктел')
        .addStringOption(option =>
            option.setName('име')
                .setDescription('Име коктела')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('random')
        .setDescription('Пронађи насумичан коктел')
];

const jagerFacts = [
    "Јегермајстер садржи 56 различитих трава и зачина! 🌿",
    "Име значи 'Мајстор ловац' на немачком! 🎯",
    "Најбоље се служи ледено хладан на -18°C! ❄️",
    "Јегермајстер је створио Курт Маст 1934. године! 🥃",
    "Лого представља причу о Светом Хубертусу! 🦌",
    "Садржи 35% алкохола! 🔥"
];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Slash commands registered!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'jeger') {
        const randomFact = jagerFacts[Math.floor(Math.random() * jagerFacts.length)];
        await interaction.reply(randomFact);
    }

    if (interaction.commandName === 'koktel') {
        const cocktailName = interaction.options.getString('име');
        try {
            const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cocktailName)}`);
            
            if (!response.data.drinks) {
                await interaction.reply('Нажалост, нисам пронашао тај коктел! 😢');
                return;
            }

            const drink = response.data.drinks[0];
            const embed = new EmbedBuilder()
                .setTitle(drink.strDrink)
                .setColor(0x0099FF)
                .setThumbnail(drink.strDrinkThumb)
                .addFields(
                    { name: 'Категорија', value: drink.strCategory || 'Није наведено' },
                    { name: 'Тип чаше', value: drink.strGlass || 'Није наведено' },
                    { name: 'Инструкције', value: drink.strInstructions || 'Није наведено' }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('Дошло је до грешке при претрази коктела! 😢');
        }
    }

    if (interaction.commandName === 'random') {
        try {
            const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
            const drink = response.data.drinks[0];
            
            const embed = new EmbedBuilder()
                .setTitle(drink.strDrink)
                .setColor(0x0099FF)
                .setThumbnail(drink.strDrinkThumb)
                .addFields(
                    { name: 'Категорија', value: drink.strCategory || 'Није наведено' },
                    { name: 'Тип чаше', value: drink.strGlass || 'Није наведено' },
                    { name: 'Инструкције', value: drink.strInstructions || 'Није наведено' }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('Дошло је до грешке при тражењу насумичног коктела! 😢');
        }
    }
});

// Start the keep-alive server
keepAlive();

client.login(process.env.TOKEN);
