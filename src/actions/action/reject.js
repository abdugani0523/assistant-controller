const { composer, middleware } = require("../../core/bot");
const { rejectedMesage } = require("../messages");
const { homeworkBtn } = require("../keys");
const { connection } = require('../../db')


composer.action('reject', async ctx => {
    const content = ctx.update.callback_query;
    let user_id = +content.message.caption.match(/User ID: \d+/g)[0].match(/\d+/g)
    let url = content.message.reply_markup.inline_keyboard[0][2].url;

    // O'quvchiga rad etilganligi haqida habar yuborish
    await ctx.telegram.sendPhoto(user_id, content.message.photo[0].file_id, {
        caption: rejectedMesage(content),
        reply_markup:homeworkBtn(url),
        parse_mode: "HTML"
    }).then()

    // Admin uchun statusni o'zgartirish
    await ctx.editMessageCaption(content.message.caption
        .replace(/pending/, 'rejected ❌')).then()


    // Databasedagi statusni 'reject' ga o'zgartirish;
    connection.connect()

    connection.query(`UPDATE Answer SET status=0 WHERE homework_id=${url.match(/\d+$/g)[0]} AND from_id=${user_id};`)

    connection.end()


    // User statusini reject qilish kerak
    ctx.editMessageText()

})




middleware(composer)