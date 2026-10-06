// Tourist Booking Flow Logic

// State
var currentDestination = null;
var counts = { adult: 2, child: 1, senior: 0 };
var prices = { adult: 50, child: 25, senior: 30 };
var currentPaymentMethod = 'UPI';
var currentBooking = null;
var DEMO_DEST_ID = 1;

// Step Navigation
function goToStep(step) {
  if (step !== 'scan' && typeof stopScanner === 'function') stopScanner();
  document.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('step-' + step).classList.add('active');
  if (step === 'destination' && !currentDestination) {
    loadDestination(DEMO_DEST_ID);
  }
}

// =====================================
// QR Scanner (camera + photo fallback)
// =====================================
var qrScanner = null;
var scanHandled = false;

function setScanStatus(msg, isError) {
  var el = document.getElementById('scan-status');
  if (!el) return;
  el.className = 'scan-status' + (isError ? ' error' : '');
  el.innerHTML = msg || '';
}

// Work out which destination a scanned QR points to
function parseDestinationFromQR(text) {
  text = String(text || '').trim();
  var m = text.match(/[?&]dest=([^&#]+)/);          // .../tourist?dest=3
  if (m) return decodeURIComponent(m[1]);
  m = text.match(/\/book\/([^\/?#]+)/);              // legacy .../book/3
  if (m) return decodeURIComponent(m[1]);
  if (/^\d+$/.test(text)) return text;               // plain id
  return null;
}

function handleScanResult(text) {
  if (scanHandled) return;
  var destId = parseDestinationFromQR(text);
  if (!destId) {
    setScanStatus('This is not a QuickVisit destination QR code.', true);
    return;
  }
  scanHandled = true;
  if (navigator.vibrate) navigator.vibrate(100);
  setScanStatus('QR detected! Loading destination...');
  stopScanner().then(function() { openDestination(destId); });
}

function openDestination(destId) {
  currentDestination = null;
  document.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('step-destination').classList.add('active');
  loadDestination(destId);
  try { history.replaceState(null, '', '/tourist?dest=' + encodeURIComponent(destId)); } catch (e) {}
  setScanStatus('');
}

async function startScanner() {
  if (qrScanner) return; // already running
  if (typeof Html5Qrcode === 'undefined') {
    setScanStatus('Scanner failed to load. Check your internet connection.', true);
    return;
  }

  // Camera needs HTTPS on phones (localhost is allowed)
  if (!window.isSecureContext) {
    var secure = window.QV_SECURE_URL ? window.QV_SECURE_URL + '/tourist' : '';
    setScanStatus(
      'Live camera needs a secure connection. ' +
      (secure ? '<a href="' + secure + '">Open secure version</a> or ' : '') +
      'use "Take / Upload QR Photo" below.', true);
    return;
  }

  scanHandled = false;
  var box = document.getElementById('qr-scanner-box');
  box.classList.add('scanning');
  document.getElementById('stop-scan-btn').style.display = 'block';
  setScanStatus('Starting camera...');

  qrScanner = new Html5Qrcode('qr-reader');
  try {
    await qrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: function(w, h) { var s = Math.floor(Math.min(w, h) * 0.75); return { width: s, height: s }; } },
      handleScanResult,
      function() { /* no QR in this frame */ }
    );
    setScanStatus('Point the camera at the QR code');
  } catch (err) {
    console.warn('Camera error:', err);
    await stopScanner();
    var msg = String(err && err.name || err);
    if (/NotAllowed|Permission/i.test(msg)) setScanStatus('Camera permission denied. Allow camera access in browser settings, or upload a photo.', true);
    else if (/NotFound|Devices/i.test(msg)) setScanStatus('No camera found. Use "Take / Upload QR Photo" below.', true);
    else setScanStatus('Could not start camera. Use "Take / Upload QR Photo" below.', true);
  }
}

async function stopScanner() {
  var box = document.getElementById('qr-scanner-box');
  if (box) box.classList.remove('scanning');
  var btn = document.getElementById('stop-scan-btn');
  if (btn) btn.style.display = 'none';
  if (!qrScanner) return;
  try { if (qrScanner.isScanning) await qrScanner.stop(); qrScanner.clear(); } catch (e) {}
  qrScanner = null;
}

// Fallback: decode a photo (works over plain HTTP too)
async function scanFromFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  if (typeof Html5Qrcode === 'undefined') {
    setScanStatus('Scanner failed to load. Check your internet connection.', true);
    return;
  }
  await stopScanner();
  setScanStatus('Reading QR code...');
  scanHandled = false;
  var reader = new Html5Qrcode('qr-reader');
  try {
    var text = await reader.scanFile(file, false);
    handleScanResult(text);
  } catch (err) {
    setScanStatus('No QR code found in that photo. Try again closer and in good light.', true);
  } finally {
    try { reader.clear(); } catch (e) {}
    input.value = '';
  }
}

// Destination Load
async function loadDestination(id) {
  document.getElementById('dest-name').textContent = 'Loading...';
  document.getElementById('dest-description').textContent = 'Fetching destination details...';
  try {
    var result = await api.destinations.get(id);
    currentDestination = result.destination;
    applyDestinationToUI(currentDestination);
  } catch (err) {
    console.warn('Backend unavailable, using demo data:', err.message);
    currentDestination = getDemoDestination();
    applyDestinationToUI(currentDestination);
  }
}

function getDemoDestination() {
  return {
    id: 1,
    name: 'Taj Mahal',
    description: 'A UNESCO World Heritage Site and one of the Seven Wonders of the World, located in Agra, India.',
    adult_price: 50,
    child_price: 25,
    senior_price: 30,
    opening_time: '06:00:00',
    closing_time: '18:30:00',
    rating: 4.8
  };
}

function applyDestinationToUI(dest) {
  prices = {
    adult:  parseFloat(dest.adult_price)  || 50,
    child:  parseFloat(dest.child_price)  || 25,
    senior: parseFloat(dest.senior_price) || 30
  };

  document.getElementById('dest-name').textContent        = dest.name;
  document.getElementById('dest-description').textContent = dest.description || 'A wonderful tourist destination.';
  document.getElementById('dest-rating').textContent      = (dest.rating || '4.5') + ' / 5';
  document.getElementById('dest-price').textContent       = 'Rs. ' + dest.adult_price;

  var hours = document.getElementById('dest-hours');
  if (hours) {
    if (dest.opening_time && dest.closing_time) {
      hours.textContent = dest.opening_time.substring(0, 5) + ' - ' + dest.closing_time.substring(0, 5);
    } else {
      hours.textContent = '9:00 - 18:00';
    }
  }

  var cap = document.getElementById('dest-capacity');
  if (cap) cap.textContent = 'Moderate (available)';

  var initials = dest.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 3).toUpperCase();
  document.getElementById('dest-image').textContent = initials;

  updatePriceLabels();
  updateTotal();
}

// Price Labels
function updatePriceLabels() {
  var al = document.getElementById('adult-price-label');
  var cl = document.getElementById('child-price-label');
  var sl = document.getElementById('senior-price-label');
  if (al) al.textContent = 'Rs. ' + prices.adult  + ' per person';
  if (cl) cl.textContent = 'Rs. ' + prices.child  + ' per person';
  if (sl) sl.textContent = 'Rs. ' + prices.senior + ' per person';
}

// Visitor Counter
function updateCount(type, delta) {
  counts[type] = Math.max(0, counts[type] + delta);
  document.getElementById(type + '-count').textContent = counts[type];
  updateTotal();
}

function updateTotal() {
  var subtotal = counts.adult * prices.adult + counts.child * prices.child + counts.senior * prices.senior;
  var total = subtotal + 5;
  var sub = document.getElementById('subtotal');
  var tot = document.getElementById('total');
  var pay = document.getElementById('pay-amount');
  if (sub) sub.textContent = 'Rs. ' + subtotal.toFixed(0);
  if (tot) tot.textContent = 'Rs. ' + total.toFixed(0);
  if (pay) pay.textContent = 'Rs. ' + total.toFixed(0);
}

// Payment Method
function selectPayment(el) {
  document.querySelectorAll('.payment-method').forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  currentPaymentMethod = el.dataset.method;
}

// Process Payment
async function processPayment() {
  var totalVisitors = counts.adult + counts.child + counts.senior;
  if (totalVisitors < 1) { alert('Please select at least one visitor.'); return; }

  var visitDate = document.getElementById('visit-date').value;
  if (!visitDate) { alert('Please select a visit date.'); return; }

  var timeSlot = document.getElementById('time-slot').value;
  var payBtn   = document.querySelector('#step-payment .btn-primary');
  var origText = payBtn ? payBtn.textContent : '';
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = 'Processing...'; }

  try {
    var bookingData = {
      destination_id: currentDestination ? currentDestination.id : DEMO_DEST_ID,
      adult_count:    counts.adult,
      child_count:    counts.child,
      senior_count:   counts.senior,
      visit_date:     visitDate,
      time_slot:      timeSlot
    };
    var bookingResult = await api.bookings.create(bookingData);
    currentBooking = bookingResult.booking;
    await api.payments.process({
      booking_id:      currentBooking.booking_id,
      payment_method:  currentPaymentMethod,
      payment_gateway: 'TestGateway'
    });
    showTicket(currentBooking, bookingResult.qr_image);
  } catch (err) {
    console.warn('Backend unavailable, using demo mode:', err.message);
    showDemoTicket(visitDate, timeSlot);
  } finally {
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = origText; }
  }
}

// Show Ticket (live backend)
function showTicket(booking, qrImage) {
  goToStep('ticket');
  var destName = currentDestination ? currentDestination.name : 'Tourist Destination';
  document.getElementById('ticket-id').textContent       = booking.booking_id;
  document.getElementById('ticket-dest').textContent     = destName;
  document.getElementById('ticket-date').textContent     = formatDate(booking.visit_date);
  document.getElementById('ticket-slot').textContent     = booking.time_slot;
  document.getElementById('ticket-visitors').textContent = booking.total_visitors;
  document.getElementById('ticket-paid').textContent     = 'Rs. ' + booking.total_amount;
  renderTicketQR(qrImage || null, booking.qr_ticket_data || booking.booking_id);
}

// Show Ticket (demo / offline)
function showDemoTicket(visitDate, timeSlot) {
  goToStep('ticket');
  var destName      = currentDestination ? currentDestination.name : 'Taj Mahal';
  var shortCode     = destName.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 3);
  var totalVisitors = counts.adult + counts.child + counts.senior;
  var total         = counts.adult * prices.adult + counts.child * prices.child + counts.senior * prices.senior + 5;
  var ticketId      = 'QV-' + shortCode + '-' + Date.now().toString(36).toUpperCase().slice(-6);

  document.getElementById('ticket-id').textContent       = ticketId;
  document.getElementById('ticket-dest').textContent     = destName;
  document.getElementById('ticket-date').textContent     = formatDate(visitDate);
  document.getElementById('ticket-slot').textContent     = timeSlot;
  document.getElementById('ticket-visitors').textContent = totalVisitors;
  document.getElementById('ticket-paid').textContent     = 'Rs. ' + total;
  renderTicketQR(null, 'QUICKVISIT|' + ticketId + '|' + shortCode + '|' + totalVisitors + '|VALID');
}

function renderTicketQR(imageUrl, qrText) {
  var qrDiv = document.getElementById('ticket-qr');
  qrDiv.innerHTML = '';
  if (imageUrl) {
    var img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '140px';
    qrDiv.appendChild(img);
  } else {
    new QRCode(qrDiv, { text: qrText, width: 140, height: 140, colorDark: '#1565c0', colorLight: '#ffffff' });
  }
}

// Utilities
function formatDate(dateStr) {
  if (!dateStr) return '--';
  var d = new Date(dateStr.indexOf('T') >= 0 ? dateStr : dateStr + 'T00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function downloadTicket() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('PDF library failed to load. Please check your internet connection and try again.');
    return;
  }

  var val = function(id) { return (document.getElementById(id).textContent || '--').trim(); };
  var ticketId = val('ticket-id');
  var rows = [
    ['Destination', val('ticket-dest')],
    ['Date',        val('ticket-date')],
    ['Time Slot',   val('ticket-slot')],
    ['Visitors',    val('ticket-visitors')],
    ['Paid',        val('ticket-paid')]
  ];

  // Grab the QR as a data URL (canvas from QRCode.js, or <img> from backend)
  var qrDiv = document.getElementById('ticket-qr');
  var qrData = null;
  var canvas = qrDiv.querySelector('canvas');
  var img = qrDiv.querySelector('img');
  try {
    if (canvas) qrData = canvas.toDataURL('image/png');
    else if (img && img.src) qrData = img.src;
  } catch (e) { console.warn('QR capture failed:', e); }

  var doc = new window.jspdf.jsPDF({ unit: 'mm', format: [100, 170] });
  var W = 100, M = 8, y;

  // Header band
  doc.setFillColor(21, 101, 192);
  doc.rect(0, 0, W, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('QuickVisit', W / 2, 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Seamless Tourist Ticketing', W / 2, 20, { align: 'center' });

  // Status
  doc.setTextColor(76, 175, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Booking Confirmed', W / 2, 36, { align: 'center' });

  // QR
  y = 41;
  if (qrData) {
    var q = 50;
    doc.addImage(qrData, 'PNG', (W - q) / 2, y, q, q);
    y += q + 6;
  } else {
    y += 4;
  }

  // Ticket ID
  doc.setTextColor(21, 101, 192);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(ticketId, W / 2, y, { align: 'center' });
  y += 6;

  // Details box
  var boxH = rows.length * 9 + 6;
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(225, 228, 232);
  doc.roundedRect(M, y, W - 2 * M, boxH, 2, 2, 'FD');
  y += 9;
  doc.setFontSize(10);
  rows.forEach(function(r, i) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 110, 110);
    doc.text(r[0], M + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    var v = doc.splitTextToSize(String(r[1]), 50)[0];
    doc.text(v, W - M - 4, y, { align: 'right' });
    if (i < rows.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.line(M + 4, y + 3.5, W - M - 4, y + 3.5);
    }
    y += 9;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('Show this QR code at the entry gate.', W / 2, 160, { align: 'center' });
  doc.text('Generated ' + new Date().toLocaleString('en-IN'), W / 2, 165, { align: 'center' });

  var safeId = ticketId.replace(/[^A-Za-z0-9_-]/g, '');
  doc.save('QuickVisit-Ticket-' + (safeId || 'ticket') + '.pdf');
}

function resetTourist() {
  currentDestination = null;
  currentBooking     = null;
  counts  = { adult: 2, child: 1, senior: 0 };
  prices  = { adult: 50, child: 25, senior: 30 };
  document.getElementById('adult-count').textContent  = 2;
  document.getElementById('child-count').textContent  = 1;
  document.getElementById('senior-count').textContent = 0;
  updatePriceLabels();
  updateTotal();
  goToStep('scan');
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var dateInput = document.getElementById('visit-date');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min   = tomorrow.toISOString().split('T')[0];
  }
  updatePriceLabels();
  updateTotal();

  // Opened by scanning a destination QR (/tourist?dest=<id>) -> skip the scan step
  var destParam = new URLSearchParams(window.location.search).get('dest');
  if (destParam) {
    document.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById('step-destination').classList.add('active');
    loadDestination(destParam);
  }
});
