export default async function handler(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
            return res.status(200).end();
  }

  if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
            let body = req.body;

          if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
                      const rawBody = await new Promise((resolve, reject) => {
                                    let data = '';
                                    req.on('data', chunk => { data += chunk; });
                                    req.on('end', () => resolve(data));
                                    req.on('error', reject);
                      });
                      if (!rawBody || rawBody.trim() === '') {
                                    return res.status(400).json({ error: 'Leerer Request-Body' });
                      }
                      body = JSON.parse(rawBody);
          } else if (typeof body === 'string') {
                      body = JSON.parse(body);
          }

          const { vorname, nachname, email, unternehmen, position, branche, groesse, nachricht, newsletter } = body;

          if (!vorname || !nachname || !email || !unternehmen) {
                      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
          }

          const contactPayload = {
                      email: email,
                      attributes: {
                                    VORNAME: vorname,
                                    NACHNAME: nachname,
                                    FIRMA: unternehmen,
                                    POSITION: position || '',
                                    BRANCHE: branche || '',
                                    GROESSE: groesse || '',
                                    HERAUSFORDERUNG: nachricht || ''
                      },
                      listIds: newsletter === 'ja' ? [2, 3] : [2],
                      updateEnabled: true
          };

          await fetch('https://api.brevo.com/v3/contacts', {
                      method: 'POST',
                      headers: {
                                    'accept': 'application/json',
                                    'content-type': 'application/json',
                                    'api-key': process.env.BREVO_API_KEY
                      },
                      body: JSON.stringify(contactPayload)
          });

          const emailPayload = {
                      sender: { name: 'BMB Deutschland', email: 'bergmann.bmb@gmail.com' },
                      to: [{ email: email, name: vorname + ' ' + nachname }],
                      bcc: [{ email: 'bergmann.bmb@gmail.com', name: 'BMB Deutschland' }],
                      subject: 'Ihr Whitepaper - BMB HumanFit Matrix',
                      htmlContent: '<div style="font-family: Calibri, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;"><div style="border-bottom: 2px solid #e87425; padding-bottom: 16px; margin-bottom: 24px;"><strong style="color: #1a3b55;">BMB</strong><span style="color: #e87425;"> HumanFit Matrix</span></div><h2 style="color: #1a3b55;">Hallo ' + vorname + ',</h2><p style="color: #4a6072; line-height: 1.7;">vielen Dank fuer Ihr Interesse am Whitepaper <strong>Wenn Organisationen die falschen Fragen stellen</strong>.</p><p style="color: #4a6072;">Wir melden uns in Kuerze mit Ihrem Download-Link.</p><p style="color: #7a8d9e; font-size: 12px; margin-top: 24px;">BMB Deutschland GmbH - Mittelstrasse 23 - 40721 Hilden</p></div>'
          };

          await fetch('https://api.brevo.com/v3/smtp/email', {
                      method: 'POST',
                      headers: {
                                    'accept': 'application/json',
                                    'content-type': 'application/json',
                                    'api-key': process.env.BREVO_API_KEY
                      },
                      body: JSON.stringify(emailPayload)
          });

          const notifyPayload = {
                      sender: { name: 'BMB Website', email: 'bergmann.bmb@gmail.com' },
                      to: [{ email: 'bergmann.bmb@gmail.com', name: 'BMB Deutschland' }],
                      subject: 'Neuer Whitepaper-Download: ' + vorname + ' ' + nachname + ' - ' + unternehmen,
                      htmlContent: '<div style="font-family: sans-serif; padding: 20px;"><h2 style="color: #1a3b55;">Neuer Whitepaper-Download</h2><p><b>Name:</b> ' + vorname + ' ' + nachname + '</p><p><b>E-Mail:</b> ' + email + '</p><p><b>Unternehmen:</b> ' + unternehmen + '</p><p><b>Position:</b> ' + (position||'-') + '</p><p><b>Branche:</b> ' + (branche||'-') + '</p><p><b>Groesse:</b> ' + (groesse||'-') + '</p><p><b>Herausforderung:</b> ' + (nachricht||'-') + '</p></div>'
          };

          await fetch('https://api.brevo.com/v3/smtp/email', {
                      method: 'POST',
                      headers: {
                                    'accept': 'application/json',
                                    'content-type': 'application/json',
                                    'api-key': process.env.BREVO_API_KEY
                      },
                      body: JSON.stringify(notifyPayload)
          });

          return res.status(200).json({ success: true });

  } catch (error) {
            console.error('Server error:', error);
            return res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
}
