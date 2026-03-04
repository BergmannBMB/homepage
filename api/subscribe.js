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
    const { vorname, nachname, email, unternehmen, position, branche, groesse, nachricht, newsletter } = req.body;

    if (!vorname || !nachname || !email || !unternehmen) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }

    // 1. Kontakt in Brevo anlegen/aktualisieren
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

    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(contactPayload)
    });

    const contactResult = await contactResponse.json();

    if (!contactResponse.ok && contactResult.code !== 'duplicate_parameter') {
      console.error('Brevo contact error:', contactResult);
    }

    // 2. Bestaetigungs-E-Mail an Nutzer
    const emailPayload = {
      sender: { name: 'BMB Deutschland', email: 'bergmann.bmb@gmail.com' },
      to: [{ email: email, name: vorname + ' ' + nachname }],
      bcc: [{ email: 'bergmann.bmb@gmail.com', name: 'BMB Deutschland' }],
      subject: 'Bitte bestaetigen: Ihr Whitepaper-Download - BMB HumanFit Matrix',
      htmlContent: '<div style="font-family: Calibri, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a2b3c;"><div style="border-bottom: 2px solid #e87425; padding-bottom: 16px; margin-bottom: 24px;"><strong style="font-size: 18px; color: #1a3b55;">BMB</strong><span style="font-size: 18px; color: #e87425;"> HumanFit Matrix</span></div><h2 style="color: #1a3b55; font-size: 22px;">Hallo ' + vorname + ',</h2><p style="font-size: 15px; line-height: 1.7; color: #4a6072;">vielen Dank fuer Ihr Interesse am Whitepaper <strong>Wenn Organisationen die falschen Fragen stellen</strong>.</p><p style="font-size: 15px; line-height: 1.7; color: #4a6072;">Wir melden uns in Kuerze mit dem Download-Link.</p><hr style="border: none; border-top: 1px solid #edf0f4; margin: 24px 0;"><p style="font-size: 12px; color: #7a8d9e;">2026 BMB Deutschland GmbH - Mittelstrasse 23 - 40721 Hilden</p></div>'
    };

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error('Brevo email error:', emailError);
      return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' });
    }

    // 3. Interne Benachrichtigung
    const notifyPayload = {
      sender: { name: 'BMB Website', email: 'bergmann.bmb@gmail.com' },
      to: [{ email: 'bergmann.bmb@gmail.com', name: 'BMB Deutschland' }],
      subject: 'Neuer Whitepaper-Download: ' + vorname + ' ' + nachname + ' - ' + unternehmen,
      htmlContent: '<div style="font-family: sans-serif; padding: 20px; color: #333;"><h2 style="color: #1a3b55;">Neuer Whitepaper-Download</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + vorname + ' ' + nachname + '</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">E-Mail</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + email + '</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Unternehmen</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + unternehmen + '</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Position</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + (position || '-') + '</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Branche</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + (branche || '-') + '</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Groesse</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + (groesse || '-') + '</td></tr><tr><td style="padding: 8px; font-weight: bold;">Herausforderung</td><td style="padding: 8px;">' + (nachricht || '-') + '</td></tr></table></div>'
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

    return res.status(200).json({ success: true, message: 'Anfrage erhalten.' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
}
