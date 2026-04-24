const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.plan === 'Free') {
            const now = new Date();
            const created = new Date(user.createdAt);
            const diffTime = Math.abs(now - created);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 7) {
                return res.status(403).json({ 
                    message: 'Votre période d\'essai Free de 7 jours est expirée. Veuillez passer à un plan supérieur pour continuer à gérer vos bots !',
                    expired: true
                });
            }
        }
        
        next();
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la vérification du plan.' });
    }
};
