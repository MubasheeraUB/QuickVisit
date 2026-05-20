// Destinations Controller
const db = require('../config/db');
const QRCode = require('qrcode');

// Get all destinations
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM destinations WHERE status = 'active' ORDER BY name"
    );
    res.json({ destinations: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Get destinations error:', err);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
};

// Get single destination
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM destinations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ destination: result.rows[0] });
  } catch (err) {
    console.error('Get destination error:', err);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
};

// Generate QR code for a destination
exports.getQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, qr_code_data FROM destinations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    const destination = result.rows[0];
    const qrData = destination.qr_code_data || `https://quickvisit.app/book/${destination.id}`;
    const qrImageDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      color: { dark: '#1565c0', light: '#FFFFFF' }
    });

    res.json({
      destination: destination.name,
      qr_data: qrData,
      qr_image: qrImageDataUrl
    });
  } catch (err) {
    console.error('Generate QR error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

// Create destination (admin)
exports.create = async (req, res) => {
  try {
    const {
      name, location, description, image_url,
      adult_price, child_price, senior_price,
      opening_time, closing_time, daily_capacity
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const result = await db.query(
      `INSERT INTO destinations
       (name, location, description, image_url, adult_price, child_price, senior_price,
        opening_time, closing_time, daily_capacity, qr_code_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name, location, description, image_url,
        adult_price || 50, child_price || 25, senior_price || 30,
        opening_time || '09:00:00', closing_time || '18:00:00',
        daily_capacity || 5000,
        `https://quickvisit.app/book/${name.toLowerCase().replace(/\s+/g, '-')}`
      ]
    );

    res.status(201).json({
      message: 'Destination created',
      destination: result.rows[0]
    });
  } catch (err) {
    console.error('Create destination error:', err);
    res.status(500).json({ error: 'Failed to create destination' });
  }
};

// Update destination (admin)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [
      'name', 'location', 'description', 'image_url',
      'adult_price', 'child_price', 'senior_price',
      'opening_time', 'closing_time', 'daily_capacity', 'status'
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(req.body[field]);
        idx++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE destinations SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Updated', destination: result.rows[0] });
  } catch (err) {
    console.error('Update destination error:', err);
    res.status(500).json({ error: 'Failed to update destination' });
  }
};

// Delete destination (admin)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM destinations WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Destination deleted' });
  } catch (err) {
    console.error('Delete destination error:', err);
    res.status(500).json({ error: 'Failed to delete destination' });
  }
};
