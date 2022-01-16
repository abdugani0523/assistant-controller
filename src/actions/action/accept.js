const { composer, middleware } = require("../../core/bot");
const { acceptMessage, changedMessage } = require("../messages");
const { homeworkBtn, getCode } = require("../keys");
const { getInfoFromID, changeStatus } = require("../lib");
const env = require("../../core/env");
const { permissionDanied } = require("../../log");

composer.action(/^accept (.+)/g, async (ctx) => {
  // Get most needed data
  const content = ctx.update.callback_query;
  const id = ctx.match[1];
  const info = getInfoFromID(id);
  let url = `t.me/c/${env.SHARE_POINT.slice(4)}/${info["homework_id"]}`;

  // Send a message to user
  await ctx.telegram
    .sendPhoto(info["from_id"], info["photo_id"], {
      caption: acceptMessage({
        first_name: content.from.first_name,
        last_name: content.from.last_name,
        username: content.from.username,
      }),
      reply_markup: homeworkBtn(url),
      parse_mode: "HTML",
    })
    .then()
    .catch(() => permissionDanied());

  // Change status from Admin Channel
  await ctx
    .editMessageCaption(
      content.message.caption.replace(/pending ⏳/g, "accepted ✅"),
      {
        reply_markup: homeworkBtn(url),
      }
    )
    .then()
    .catch(() => permissionDanied());

  // Change status from database
  changeStatus(1, id);

  // Change the user status in the group
  await ctx.telegram
    .editMessageText(
      env.CONFESSION,
      info["replaced_message_id"],
      null,
      changedMessage(
        {
          first_name: info["first_name"],
          last_name: info["last_name"],
          username: info["username"],
        },
        "accepted ✅"
      ),
      {
        reply_markup: getCode(id),
        parse_mode: "HTML",
      }
    )
    .then()
    .catch(() => permissionDanied());
});

middleware(composer);
