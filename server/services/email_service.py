"""
DEVNEXUS TECH — Transactional Email Service (Resend, SendGrid, SMTP).
"""

import html
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import requests

from server.config import Config, _is_real_secret


def _send_via_resend(to_email: str, subject: str, html_body: str, reply_to: str | None = None) -> tuple[bool, str]:
    payload = {
        "from": Config.EMAIL_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    res = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {Config.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=10,
    )
    if res.ok:
        return True, f"Sent via Resend (id={res.json().get('id', 'ok')})"
    return False, f"Resend error HTTP {res.status_code}: {res.text[:200]}"


def _send_via_sendgrid(to_email: str, subject: str, html_body: str, reply_to: str | None = None) -> tuple[bool, str]:
    from_email = Config.EMAIL_FROM
    if "<" in from_email and ">" in from_email:
        sender_name = from_email.split("<")[0].strip()
        sender_addr = from_email.split("<")[1].split(">")[0].strip()
    else:
        sender_name = "DEVNEXUS TECH"
        sender_addr = from_email

    payload = {
        "personalizations": [{"to": [{"email": to_email}], "subject": subject}],
        "from": {"email": sender_addr, "name": sender_name},
        "content": [{"type": "text/html", "value": html_body}],
    }
    if reply_to:
        payload["reply_to"] = {"email": reply_to}

    res = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {Config.SENDGRID_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=10,
    )
    if res.status_code in (200, 202):
        return True, "Sent via SendGrid"
    return False, f"SendGrid error HTTP {res.status_code}: {res.text[:200]}"


def _send_via_smtp(to_email: str, subject: str, html_body: str, reply_to: str | None = None) -> tuple[bool, str]:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"DEVNEXUS TECH <{Config.SMTP_USER}>"
    msg["To"] = to_email
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(Config.SMTP_USER, Config.SMTP_PASS)
        server.send_message(msg)
    return True, "Sent via SMTP"


def send_email(to_email: str, subject: str, html_body: str, reply_to: str | None = None) -> dict:
    """Dispatches transactional email using the highest-priority configured provider."""
    try:
        if _is_real_secret(Config.RESEND_API_KEY):
            ok, info = _send_via_resend(to_email, subject, html_body, reply_to)
            return {"sent": ok, "provider": "resend", "detail": info}

        if _is_real_secret(Config.SENDGRID_API_KEY):
            ok, info = _send_via_sendgrid(to_email, subject, html_body, reply_to)
            return {"sent": ok, "provider": "sendgrid", "detail": info}

        if _is_real_secret(Config.SMTP_HOST) and _is_real_secret(Config.SMTP_USER) and _is_real_secret(Config.SMTP_PASS):
            ok, info = _send_via_smtp(to_email, subject, html_body, reply_to)
            return {"sent": ok, "provider": "smtp", "detail": info}

        return {
            "sent": False,
            "provider": None,
            "detail": "Email provider pending configuration (set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials).",
        }
    except Exception as exc:
        return {"sent": False, "provider": "error", "detail": str(exc)}


def send_inquiry_emails(inquiry) -> dict:
    """Sends admin alert email and client confirmation email for a new inquiry."""
    safe_name = html.escape(inquiry.full_name)
    safe_email = html.escape(inquiry.email)
    safe_company = html.escape(inquiry.company_name or "Independent / Direct")
    safe_phone = html.escape(inquiry.phone or "Not provided")
    safe_country = html.escape(inquiry.country)
    safe_type = html.escape(inquiry.project_type)
    safe_budget = html.escape(inquiry.budget)
    safe_msg = html.escape(inquiry.message)

    admin_html = f"""
    <html><body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#060a13;padding:24px;border-bottom:3px solid #00d2ff;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:2px;color:#38bdf8;font-weight:700;">DEVNEXUS TECH • ADMIN ALERT</div>
          <h2 style="margin:6px 0 0;font-size:20px;">New Project Inquiry #{inquiry.id}</h2>
        </div>
        <div style="padding:24px;">
          <p style="margin-top:0;"><strong>Client:</strong> {safe_name} ({safe_company})</p>
          <p><strong>Email:</strong> {safe_email} | <strong>Phone:</strong> {safe_phone}</p>
          <p><strong>Country:</strong> {safe_country} | <strong>Service:</strong> {safe_type}</p>
          <p><strong>Budget:</strong> {safe_budget}</p>
          <div style="background:#f1f5f9;border-left:4px solid #00d2ff;padding:14px;border-radius:6px;white-space:pre-wrap;margin-top:16px;">{safe_msg}</div>
        </div>
      </div>
    </body></html>
    """

    client_html = f"""
    <html><body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#060a13;padding:24px;border-bottom:3px solid #00d2ff;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:2px;color:#38bdf8;font-weight:700;">DEVNEXUS TECH</div>
          <h2 style="margin:6px 0 0;font-size:20px;">We Received Your Project Brief</h2>
        </div>
        <div style="padding:24px;">
          <p>Hello {safe_name},</p>
          <p>Thank you for contacting <strong>DEVNEXUS TECH</strong> regarding <strong>{safe_type}</strong> (Estimated Budget: {safe_budget}).</p>
          <p>Our engineering team is reviewing your technical requirements and will reply personally within <strong>24 business hours</strong> with next steps.</p>
          <p style="margin-top:24px;font-size:13px;color:#475569;">Engineering Tomorrow's Digital World.<br/><strong>DEVNEXUS TECH</strong></p>
        </div>
      </div>
    </body></html>
    """

    receiver = Config.NOTIFICATION_RECEIVER or Config.SMTP_USER
    admin_res = (
        send_email(
            receiver,
            f"New DEVNEXUS TECH Inquiry: {inquiry.project_type} — {inquiry.full_name}",
            admin_html,
            reply_to=inquiry.email,
        )
        if receiver
        else {"sent": False, "provider": None, "detail": "NOTIFICATION_RECEIVER not configured."}
    )
    client_res = send_email(
        inquiry.email,
        "DEVNEXUS TECH — Inquiry Confirmation",
        client_html,
    )
    return {"admin_notification": admin_res, "client_confirmation": client_res}
