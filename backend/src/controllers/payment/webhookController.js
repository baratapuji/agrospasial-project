const webhookService = require('../../services/payment/webhookService');

const handleNotification = async (req, res, next) => {
  try {
    await webhookService.handleMidtransNotification(req.body);
    return res.status(200).json({ status: 'success', message: 'Webhook processed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleNotification,
};