const me = async (req, res, next) => {
  try {
    res.json({ user: req.user, message: 'Admin access granted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { me };