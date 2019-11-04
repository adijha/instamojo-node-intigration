const express = require('express');
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');

let temp1;
let temp2;

const Insta = require('instamojo-nodejs');
const url = require('url');

app.use(
	express.urlencoded({
		extended: true
	})
);

app.use(express.json());
app.use(express.text());
app.use(cors());

mongoose
	.connect('mongodb+srv://java:gogomaster@database-qrvyh.mongodb.net/smsRecharge', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('DB Connected'));

// @route  /pay
app.post('/pay', (req, res) => {
	console.log('/pay-22->body', req.body);
	console.log('/pay-23->headers', req.headers);
	const body = JSON.parse(req.body);
	console.log('/pay-25->Pbody', body);
	temp1 = body;

	Insta.setKeys('test_c496eefc2cceece396905f07440', 'test_b7781fba1a5e484e80cde59e36b');

	const data = new Insta.PaymentData();
	Insta.isSandboxMode(true);

	data.purpose = body.purpose;
	data.amount = body.amount;
	data.buyer_name = body.buyer_name;
	data.redirect_url = 'http://localhost:6000';
	data.email = body.email;
	data.phone = body.phone;
	data.send_email = false;
	data.webhook = 'http://www.example.com/webhook/';
	data.send_sms = false;
	data.allow_repeated_payments = false;

	Insta.createPayment(data, function(error, response) {
		if (error) {
			console.log(error);
		} else {
			const responseData = JSON.parse(response);
			const redirectUrl = responseData.payment_request.longurl;
			res.send(redirectUrl);
		}
	});
});

/**
 * @route GET api/bid/callback/
 * @desc Call back url for instamojo
 * @access public
 */
app.get('/callback/', (req, res) => {
	let url_parts = url.parse(req.url, true),
		responseData = url_parts.query;

	if (responseData.payment_id) {
		temp2 = responseData;
		const order = { ...temp1, ...temp2 };

		return res.redirect('http://localhost:6000/payment-complete');
	}
});

const port = process.env.PORT || 6000;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
