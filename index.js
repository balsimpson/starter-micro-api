// var http = require('http');
// http.createServer(function (req, res) {
//     console.log(`Just got a request at ${req.url}!`)
//     res.write('Yo!');
//     res.end();
// }).listen(process.env.PORT || 3000);

const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');

// Replace YOUR_OPENAI_KEY with your OpenAI API key
const configuration = new Configuration({
  apiKey: 'YOUR_OPENAI_KEY',
});

const openai = new OpenAIApi(configuration);

async function sendMessage(msg, from, token, id) {
  const url = `https://graph.facebook.com/v15.0/${id}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_type: 'RESPONSE',
      recipient: {
        id: from,
      },
      message: {
        text: msg,
      },
    }),
  });
  return res.json();
}

async function handleMessage(body) {
  const {
    from,
    text: { body: msgBody },
  } = body.entry[0].changes[0].value.messages[0];
  // Replace YOUR_WHATSAPP_ACCESS_TOKEN with your WhatsApp access token
  const token = 'YOUR_WHATSAPP_ACCESS_TOKEN';
  const id = body.entry[0].changes[0].value.metadata.phone_number_id;

  // Replace MODEL_NAME with the name of the OpenAI model you want to use
  const model = 'MODEL_NAME';
  const prediction = await openai.createCompletion({
    model,
    prompt: msgBody,
    max_tokens: 256,
    temperature: 0.7,
  });

  await sendMessage(prediction.data.choices[0].text, from, token, id);
}

module.exports = handleMessage;
