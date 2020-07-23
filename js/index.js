var api_url = 'https://chitrank0614-all-in-one.herokuapp.com';
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
function validateEmail(emailField) {
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

	if (reg.test(emailField) == false) {
		return false;
	}

	return true;
}

async function getOTP() {
	document.getElementById('server-message').innerHTML = '';
	document.getElementById('server-message').style.display = 'none';
	userName = document.getElementById('user-name').value;
	userEmail = document.getElementById('user-email').value;
	message = document.getElementById('user-message').value;

	if (userName == '' || userEmail == '' || message == '') {
		document.getElementById('server-message').innerHTML =
			'Please fill all details..';
		document.getElementById('server-message').style.display = 'block';
		return;
	}

	if (!validateEmail(userEmail)) {
		document.getElementById('server-message').innerHTML = 'Email not valid';
		document.getElementById('server-message').style.display = 'block';
		return;
	}
	queryObj = {
		UserEmail: userEmail,
	};
	response = await makeAsyncPostRequest('/getOTP/', queryObj);
	OTPsession = response.result['SessionID'];
	console.log('OTP sent', 'Session: ', OTPsession);
	document.getElementById('getOTP').style.display = 'none';
	document.getElementById('checkOTP').style.display = 'block';
	document.getElementById('OTProw').style.display = 'block';
}

async function checkOTP() {
	document.getElementById('server-message').innerHTML = '';
	document.getElementById('server-message').style.display = 'none';
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
	if (response['result'] == 'OTP Matched. Message Sent') {
		document.getElementById('server-message').innerHTML = 'Message Sent';
		document.getElementById('server-message').style.display = 'block';
	} else {
		document.getElementById('server-message').innerHTML = 'Wrong OTP';
		document.getElementById('server-message').style.display = 'block';
	}
	console.log(response);
}
