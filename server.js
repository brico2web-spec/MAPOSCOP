// ==================== Ahmed TOUR - Backend Server ==================== 
// Node.js + Express Server
// Run with: node server.js
// Install dependencies: npm install express body-parser cors nodemailer

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// ==================== Middleware ==================== 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ==================== Data Storage ==================== 
const reservationsFile = path.join(__dirname, 'reservations.json');

// Initialize reservations file if it doesn't exist
if (!fs.existsSync(reservationsFile)) {
    fs.writeFileSync(reservationsFile, JSON.stringify([], null, 2));
}

// ==================== Email Configuration ==================== 
// Configure with your email service
const transporter = nodemailer.createTransport({
    service: 'gmail', // or other email service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// ==================== Routes ==================== 

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all cars
app.get('/api/cars', (req, res) => {
    const cars = [
        { id: 1, name: 'Économique', category: 'economique', pricePerDay: 250 },
        { id: 2, name: 'Citadine', category: 'economique', pricePerDay: 300 },
        { id: 3, name: 'Confort', category: 'confort', pricePerDay: 450 },
        { id: 4, name: 'SUV', category: 'confort', pricePerDay: 550 },
        { id: 5, name: 'Premium', category: 'premium', pricePerDay: 800 },
        { id: 6, name: 'Monospace', category: 'premium', pricePerDay: 700 }
    ];
    res.json(cars);
});

// Get all reservations (admin view)
app.get('/api/reservations', (req, res) => {
    try {
        const reservations = JSON.parse(fs.readFileSync(reservationsFile, 'utf8'));
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Error reading reservations' });
    }
});

// Create new reservation
app.post('/api/reservations', (req, res) => {
    try {
        const { name, email, phone, checkIn, checkOut, carType, message } = req.body;

        // Validation
        if (!name || !email || !phone || !checkIn || !checkOut || !carType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create reservation object
        const reservation = {
            id: Date.now(),
            name,
            email,
            phone,
            checkIn,
            checkOut,
            carType,
            message,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to file
        const reservations = JSON.parse(fs.readFileSync(reservationsFile, 'utf8'));
        reservations.push(reservation);
        fs.writeFileSync(reservationsFile, JSON.stringify(reservations, null, 2));

        // Send confirmation emails
        sendConfirmationEmail(reservation);
        sendAdminNotification(reservation);

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            reservation
        });

    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Error creating reservation' });
    }
});

// Update reservation status
app.put('/api/reservations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const reservations = JSON.parse(fs.readFileSync(reservationsFile, 'utf8'));
        const index = reservations.findIndex(r => r.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        reservations[index].status = status;
        reservations[index].updatedAt = new Date().toISOString();

        fs.writeFileSync(reservationsFile, JSON.stringify(reservations, null, 2));

        res.json({
            success: true,
            message: 'Reservation updated',
            reservation: reservations[index]
        });

    } catch (error) {
        res.status(500).json({ error: 'Error updating reservation' });
    }
});

// Delete reservation
app.delete('/api/reservations/:id', (req, res) => {
    try {
        const { id } = req.params;

        const reservations = JSON.parse(fs.readFileSync(reservationsFile, 'utf8'));
        const filtered = reservations.filter(r => r.id !== parseInt(id));

        if (filtered.length === reservations.length) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        fs.writeFileSync(reservationsFile, JSON.stringify(filtered, null, 2));

        res.json({
            success: true,
            message: 'Reservation deleted'
        });

    } catch (error) {
        res.status(500).json({ error: 'Error deleting reservation' });
    }
});

// ==================== Email Functions ==================== 

function sendConfirmationEmail(reservation) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@groupebahia.com',
        to: reservation.email,
        subject: 'Confirmation de Réservation - Groupe Bahia Ahmed TOUR',
        html: `
            <h2>Merci pour votre réservation!</h2>
            <p>Bonjour ${reservation.name},</p>
            <p>Votre réservation a été reçue. Voici les détails:</p>
            <ul>
                <li><strong>Date de départ:</strong> ${new Date(reservation.checkIn).toLocaleDateString('fr-FR')}</li>
                <li><strong>Date de retour:</strong> ${new Date(reservation.checkOut).toLocaleDateString('fr-FR')}</li>
                <li><strong>Type de véhicule:</strong> ${reservation.carType}</li>
            </ul>
            <p>Un agent vous contactera sous peu pour confirmer votre réservation.</p>
            <p>Cordialement,<br>Groupe Bahia - Ahmed TOUR</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
                Tél: 06 61 17 01 82 | Email: ahmadi2011@live.fr
            </p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Confirmation email sent:', info.response);
        }
    });
}

function sendAdminNotification(reservation) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@groupebahia.com',
        to: 'ahmadi2011@live.fr',
        subject: 'Nouvelle Réservation - ' + reservation.name,
        html: `
            <h2>Nouvelle Réservation Reçue</h2>
            <p><strong>Client:</strong> ${reservation.name}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Téléphone:</strong> ${reservation.phone}</p>
            <p><strong>Départ:</strong> ${new Date(reservation.checkIn).toLocaleDateString('fr-FR')}</p>
            <p><strong>Retour:</strong> ${new Date(reservation.checkOut).toLocaleDateString('fr-FR')}</p>
            <p><strong>Véhicule:</strong> ${reservation.carType}</p>
            <p><strong>Message:</strong> ${reservation.message || 'Aucun message'}</p>
            <p><strong>Statut:</strong> ${reservation.status}</p>
            <p><strong>ID:</strong> ${reservation.id}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending admin email:', error);
        } else {
            console.log('Admin email sent:', info.response);
        }
    });
}

// ==================== Error Handling ==================== 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== Start Server ==================== 
app.listen(PORT, () => {
    console.log(`
    ========================================
    Groupe Bahia - Ahmed TOUR
    Serveur démarré sur http://localhost:${PORT}
    ========================================
    
    Routes disponibles:
    - GET  /                 - Page d'accueil
    - GET  /api/cars         - Liste des véhicules
    - GET  /api/reservations - Toutes les réservations
    - POST /api/reservations - Créer une réservation
    - PUT  /api/reservations/:id - Mettre à jour une réservation
    - DELETE /api/reservations/:id - Supprimer une réservation
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
