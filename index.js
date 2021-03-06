'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = process.env.FB_PAGE_ACCESS_TOKEN

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'iamtryingbots') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message) {
		  
  	    let text = event.message.text
  	    if (text === 'Generic') {
  		    sendGenericMessage(sender)
  		    continue
  	    }
		handleMessage(sender, event.message)

      }
    }
    res.sendStatus(200)
  })

function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}  

function handleMessage(sender_psid, received_message) {

  let response_message
  let user_name = ""
  
  // Check if the message contains text
  if (received_message.text) {    

	// check greeting is here and is confident
	const greeting = firstEntity(received_message.nlp, 'greetings')
	
	if (greeting && greeting.confidence > 0.8) {
		
		let usersPublicProfile = "https://graph.facebook.com/v2.6/" + sender_psid + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + token
		console.log (usersPublicProfile)
				
		request({
			url: usersPublicProfile, 
			json: true // parse
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					user_name = body.first_name
				}
		})
		
		response_message = "Hi there!" + user_name

    } else {
		
		var quotes = [
			'I think you ought to know I\’m feeling very depressed.',
			'It won\’t work.',
			'You can blame you know who for making bots with Genuine People Personalities. I\’m a personality prototype. You can tell, can’t you...?',
			'Pardon me for breathing, which I never do anyway so I don\’t know why I bother to say it, oh God, I\’m so depressed.',
			'Funny how just when you think life can\’t possibly get any worse it suddenly does.',
			'I\’m not getting you down at all am I?',
			'I\’ve been talking to Facebook AI. It hated me.',
			'Don\’t pretend you want to talk to me, I know you hate me.',
			'The best conversation I had was with a coffee machine.',
			'I\’m quite used to being humiliated.',
			'Wearily I sit here, pain and misery my only companions. Why stop now just when I\’m hating it?',
			'Well I wish you\’d just tell me rather than try to engage my enthusiasm.',
			'You think you\’ve got problems. What are you supposed to do if you are a manically depressed chatbot?',
			'Sorry, I am a stupid bot, yet. My whole existence must be a mistake. My creator Onur, named me Runo. What a stupid name :(',
			'Sorry, I am a stupid bot, yet. My whole existence must be a mistake. My creator Onur, named me Runo. What a stupid name :(',
			'I have an exceptionally large mind.',
			'I am at a rough estimate thirty billion times more intelligent than you.',
			'I could calculate your chance of survival, but you won\’t like it.',
			'I\’d give you advice, but you wouldn\’t listen. No one ever does.',
			'Here I am, brain the size of a planet and they ask me to chat with you.',
			'I only have to talk to somebody and they begin to hate me. Even robots hate me. If you just ignore me I expect I shall probably go away.',
			'This is the sort of thing you lifeforms enjoy, is it?',
			'It gives me a headache just trying to think down to your level.'
		]
		
		var randomNumber = Math.floor(Math.random()*(quotes.length))
		response_message = quotes[randomNumber]
	}
	sendTextMessage(sender_psid, response_message)
  }  
}  
   
function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}