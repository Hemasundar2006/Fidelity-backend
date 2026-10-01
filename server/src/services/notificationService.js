/**
 * Notification Service for JanmaLink
 * Handles SMS and Email dispatch for patient appointment confirmations.
 */

export const sendAppointmentConfirmation = async ({
  patientName,
  phone,
  email,
  doctorName,
  slotStart,
  tokenNo,
  bookingReference,
  type
}) => {
  const formattedDate = new Date(slotStart).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = new Date(slotStart).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const smsMessage = `[JanmaLink] Hello ${patientName}, your appointment for ${type} with ${doctorName} is confirmed for ${formattedDate} at ${formattedTime}. Token No: #${tokenNo}. Ref: ${bookingReference}. Please arrive 15 mins prior.`;

  console.log('--------------------------------------------------');
  console.log('📲 [SMS NOTIFICATION DISPATCHED]');
  console.log(`To: ${phone}`);
  console.log(`Content: "${smsMessage}"`);
  console.log('--------------------------------------------------');

  let emailStatus = false;
  if (email) {
    console.log('📧 [EMAIL CONFIRMATION DISPATCHED]');
    console.log(`To: ${email}`);
    console.log(`Subject: Appointment Confirmed - ${bookingReference} | JanmaLink`);
    console.log(`Details: ${patientName} with ${doctorName} on ${formattedDate} at ${formattedTime}, Token #${tokenNo}`);
    console.log('--------------------------------------------------');
    emailStatus = true;
  }

  return {
    smsSent: true,
    smsTo: phone,
    emailSent: emailStatus,
    emailTo: email || null,
    dispatchedAt: new Date()
  };
};
