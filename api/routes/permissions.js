const permissions = (req, res, next) => {
  const { payload } = req;

  let id;
  const url = req.baseUrl;
  if (url === '/api/users') {
    id = req.params.userId;
  } else if (url.startsWith('/api/events')) {
    if (url.endsWith('/attendants')) {
      id = req.body.attendant.user;
    } else if (url.endsWith('/comments')) {
      id = req.body.comment.user;
    } else {
      id = req.body.event.createdBy;
    }
  }

  if (payload._id === id || payload.admin) {
    next();
  } else {
    res.status(403).json({
      errors: [
        {
          param: 'Permissions',
          msg: "aren't enough",
        },
      ],
    });
  }
};

module.exports = permissions;