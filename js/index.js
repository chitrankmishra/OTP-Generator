var api_url = 'http://127.0.0.1:5000';
OTPsession = -1;

function makeAsyncPostRequest(path, queryObject) {
	return new Promise(function (resolve, reject) {
		axios.post(api_url + path, queryObject).then(
			(response) => {
				var returnObj = response.data;
				console.log('Async Post Request');
				resolve(returnObj);
			},
			(error) => {
				reject(error);
			}
		);
	});
}

async function getOTP() {
	queryObj = {
		UserEmail: document.getElementById('user-email').value,
	};
	response = await makeAsyncPostRequest('/getOTP/', queryObj);
	OTPsession = response.result['SessionID'];
	console.log('OTP sent', 'Session: ', OTPsession);
	document.getElementById('getOTP').style.display = 'none';
	document.getElementById('checkOTP').style.display = 'block';
	document.getElementById('OTProw').style.display = 'block';
}

async function checkOTP() {
	otp = document.getElementById('otp').value;
	userName = document.getElementById('user-name').value;
	userEmail = document.getElementById('user-email').value;
	message = document.getElementById('user-message').value;
	queryObj = {
		UserName: userName,
		UserEmail: userEmail,
		Message: message,
		OTP: otp,
		SessionID: OTPsession,
	};
	response = await makeAsyncPostRequest('/checkOTP/', queryObj);
	console.log(response);
}
