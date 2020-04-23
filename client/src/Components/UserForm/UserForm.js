import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';

import Style from '../Style/Style';

const UserForm = (props) => {
  const {
    name,
    handleNameChange,
    email,
    handleEmailChange,
    dateOfBirth,
    handleDateOfBirthChange,
    avatar,
    handleUpload,
    validationErrors,
  } = props;

  const style = Style();

  return (
    <Box p={1}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Avatar
            className={style.avatar}
            src={avatar}
            alt={`${name}'s avatar`}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid item>
          <TextField
            className={style.formInput}
            type="file"
            accept="image/*"
            label="Avatar"
            variant="outlined"
            onChange={(event) => handleUpload(event.target.files[0])}
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.fileType || !!validationErrors.avatar}
            helperText={validationErrors.fileType || validationErrors.avatar}
          />
        </Grid>
        <Grid item>
          <TextField
            className={style.formInput}
            label="Name"
            variant="outlined"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
        </Grid>
        <Grid item>
          <TextField
            className={style.formInput}
            label="Email"
            variant="outlined"
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
        </Grid>
        <Grid item>
          <TextField
            className={style.formInput}
            type="date"
            label="Date of birth"
            variant="outlined"
            value={dateOfBirth}
            onChange={(event) => handleDateOfBirthChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.dateOfBirth}
            helperText={validationErrors.dateOfBirth}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;