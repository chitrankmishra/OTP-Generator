from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
import datetime
import random
import smtplib
import ssl
from string import Template
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


connection_url = ''  # Your mongodb database URL

app = Flask(__name__)
CORS(app)

client = pymongo.MongoClient(connection_url, connect=False)
ApiDatabase = client.get_database('')  # Add database name
OTPRequests = ApiDatabase.OTPRequests
SiteData = ApiDatabase.SiteData
# OTPRequests.create_index("GeneratedAt", expireAfterSeconds=10*60)


def getRandom():
    return random.randint(10000, 100000)


def sendEmail(to, subject, body):
    s = smtplib.SMTP(host='smtp.gmail.com', port=587)
    s.starttls()
    serveremail = ''  # Your email
    serverpassword = ''  # Your email password
    s.login(serveremail, serverpassword)

    msg = MIMEMultipart()
    msg['From'] = serveremail
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    s.sendmail(serveremail,
               to, msg.as_string())
    del msg
    s.quit()
    return jsonify({'result': 'Done'})


@app.route('/send-email/', methods=['POST'])
def sendEmailUtil():
    to = request.json['To']
    subject = request.json['Subject']
    body = request.json['Body']
    sendEmail(to, subject, body)
    output = {'Status': 'Sent'}
    return jsonify(output)


@app.route('/checkOTP/', methods=['POST'])
def checkOTP():
    sessionID = request.json['SessionID']
    otp = request.json['OTP']
    userName = request.json['UserName']
    userEmail = request.json['UserEmail']
    userMessage = request.json['Message']

    query = OTPRequests.find_one({'SessionID': sessionID})

    if(query != None):
        if(int(query['OTP']) == int(otp)):
            OTPRequests.delete_one({'SessionID': sessionID})

            subject = "Webpage Visit: "+userName
            message_template = """You received a message from {USERNAME}.

            {MESSAGE}

            Contact: {CONTACT}
            Webpage"""

            message_template = message_template.replace('{USERNAME}', userName)
            message_template = message_template.replace(
                '{MESSAGE}', userMessage)
            message_template = message_template.replace('{CONTACT}', userEmail)

            # Add your reciever email where you want to receive the usermessage, in the qoutes.
            sendEmail('', subject, message_template)
            return jsonify({'result': "OTP Matched. Message Sent"})
        else:
            return jsonify({'result': "OTP Not Matched."})
    else:
        return jsonify({'result': 'OTP Expired'})


@app.route('/getOTP/', methods=['POST'])
def getOTP():
    userEmail = request.json['UserEmail']
    queryObj = {
        'Data': 'SessionID'
    }
    query = SiteData.find_one(queryObj)
    currSessionID = query['SessionID']
    timestamp = datetime.datetime.utcnow()
    otp = getRandom()

    subject = "OTP Verification"
    message = """
    Hello,
    
    Please enter the below OTP to proceed (valid for 10 minutes only):
    {OTP}
    
    Thank You,
    """
    message = message.replace('{OTP}', str(otp))

    print("Sending:\n", message, "\nTo", userEmail, sep=" ")
    sendEmail(userEmail, subject, message)

    queryObj = {
        'GeneratedAt': timestamp,
        'SessionID': currSessionID,
        'UserEmail': userEmail,
        'OTP': otp
    }
    query = OTPRequests.insert_one(queryObj)

    queryObj = {
        'Data': 'SessionID',
        'SessionID': currSessionID+1,
    }
    query = SiteData.update_one({'Data': 'SessionID'}, {
        '$set': queryObj}, upsert=True)

    return jsonify({'result': {'SessionID': currSessionID}})


if __name__ == '__main__':
    app.run(debug=True)
    # print(getRandom())
