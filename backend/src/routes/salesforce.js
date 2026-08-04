const express = require('express');
const router = express.Router();

const SF_LOGIN_URL = 'https://login.salesforce.com';
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD; 

async function getSalesforceAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: SF_CLIENT_ID,
    client_secret: SF_CLIENT_SECRET,
    username: SF_USERNAME,
    password: SF_PASSWORD
  });

  const res = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    body: params
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Salesforce auth failed');
  return { accessToken: data.access_token, instanceUrl: data.instance_url };
}

router.post('/export-user', async (req, res) => {
  try {
    const { companyName, phone, positionTitle, userEmail, firstName, lastName } = req.body;

    const { accessToken, instanceUrl } = await getSalesforceAccessToken();

    const accountRes = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Account`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: companyName || `${firstName || ''} ${lastName || ''} Account`.trim(),
        Phone: phone || ''
      })
    });
    const accountData = await accountRes.json();
    if (!accountRes.ok) throw new Error(JSON.stringify(accountData));

    const contactRes = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Contact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        FirstName: firstName || 'User',
        LastName: lastName || 'Candidate',
        Email: userEmail,
        Phone: phone || '',
        Title: positionTitle || 'Candidate',
        AccountId: accountData.id
      })
    });
    const contactData = await contactRes.json();

    res.status(200).json({ success: true, accountId: accountData.id, contactId: contactData.id });
  } catch (err) {
    console.error('SF Error:', err);
    res.status(500).json({ error: err.message || 'Salesforce Integration Error' });
  }
});

module.exports = router;